# Backend Implementation Guide: Favorites System

## Overview
Add database-backed favorites functionality to allow users to favorite topup products.

---

## 1. Database Schema

### Create UserFavorite Model/Table

```ruby
# For Rails/ActiveRecord migration:
class CreateUserFavorites < ActiveRecord::Migration[7.0]
  def change
    create_table :user_favorites do |t|
      t.references :user, null: false, foreign_key: true
      t.references :topup_product, null: false, foreign_key: true
      t.timestamps
    end

    add_index :user_favorites, [:user_id, :topup_product_id], unique: true, name: 'index_user_favorites_on_user_and_product'
  end
end
```

```sql
-- Or raw SQL:
CREATE TABLE user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topup_product_id BIGINT NOT NULL REFERENCES topup_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topup_product_id)
);

CREATE INDEX index_user_favorites_on_user_id ON user_favorites(user_id);
CREATE INDEX index_user_favorites_on_topup_product_id ON user_favorites(topup_product_id);
```

---

## 2. GraphQL Schema Updates

### Add to your GraphQL schema:

```graphql
# Extend TopupProduct type
type TopupProduct {
  # ... existing fields ...
  isFavorite: Boolean!
}

# Mutation payload types
type AddFavoritePayload {
  topupProduct: TopupProduct
  errors: [String!]!
}

type RemoveFavoritePayload {
  topupProduct: TopupProduct
  errors: [String!]!
}

# Extend Mutation type
type Mutation {
  addFavorite(input: AddFavoriteInput!): AddFavoritePayload
  removeFavorite(input: RemoveFavoriteInput!): RemoveFavoritePayload
}

# Input types
input AddFavoriteInput {
  productId: ID!
}

input RemoveFavoriteInput {
  productId: ID!
}

# Extend Query type
type Query {
  myFavorites: [TopupProduct!]!
}
```

---

## 3. Backend Implementation

### A. UserFavorite Model

```ruby
# app/models/user_favorite.rb
class UserFavorite < ApplicationRecord
  belongs_to :user
  belongs_to :topup_product

  validates :user_id, uniqueness: { scope: :topup_product_id }
end
```

### B. Update User Model

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_many :user_favorites, dependent: :destroy
  has_many :favorite_products, through: :user_favorites, source: :topup_product

  def favorite?(topup_product)
    user_favorites.exists?(topup_product_id: topup_product.id)
  end
end
```

### C. TopupProduct Type - Add isFavorite field

```ruby
# app/graphql/types/topup_product_type.rb
module Types
  class TopupProductType < Types::BaseObject
    # ... existing fields ...

    field :is_favorite, Boolean, null: false

    def is_favorite
      return false unless context[:current_user]

      # Option 1: If you have a preloaded association
      # object.favorited_by_users.include?(context[:current_user])

      # Option 2: Direct query
      context[:current_user].favorite?(object)

      # Option 3: Using a dataloader for better performance
      # dataloader.with(Sources::UserFavorite, context[:current_user].id).load(object.id)
    end
  end
end
```

### D. AddFavorite Mutation

```ruby
# app/graphql/mutations/add_favorite.rb
module Mutations
  class AddFavorite < BaseMutation
    description "Add a product to user's favorites"

    argument :product_id, ID, required: true

    field :topup_product, Types::TopupProductType, null: true
    field :errors, [String], null: false

    def resolve(product_id:)
      user = context[:current_user]

      unless user
        return {
          topup_product: nil,
          errors: ["You must be logged in to add favorites"]
        }
      end

      topup_product = TopupProduct.find_by(id: product_id)

      unless topup_product
        return {
          topup_product: nil,
          errors: ["Product not found"]
        }
      end

      favorite = user.user_favorites.build(topup_product: topup_product)

      if favorite.save
        {
          topup_product: topup_product,
          errors: []
        }
      else
        {
          topup_product: nil,
          errors: favorite.errors.full_messages
        }
      end
    rescue ActiveRecord::RecordNotUnique
      # Already favorited - return success
      {
        topup_product: topup_product,
        errors: []
      }
    end
  end
end
```

### E. RemoveFavorite Mutation

```ruby
# app/graphql/mutations/remove_favorite.rb
module Mutations
  class RemoveFavorite < BaseMutation
    description "Remove a product from user's favorites"

    argument :product_id, ID, required: true

    field :topup_product, Types::TopupProductType, null: true
    field :errors, [String], null: false

    def resolve(product_id:)
      user = context[:current_user]

      unless user
        return {
          topup_product: nil,
          errors: ["You must be logged in to remove favorites"]
        }
      end

      topup_product = TopupProduct.find_by(id: product_id)

      unless topup_product
        return {
          topup_product: nil,
          errors: ["Product not found"]
        }
      end

      favorite = user.user_favorites.find_by(topup_product: topup_product)

      if favorite
        favorite.destroy
      end

      {
        topup_product: topup_product,
        errors: []
      }
    end
  end
end
```

### F. MyFavorites Query

```ruby
# app/graphql/types/query_type.rb
module Types
  class QueryType < Types::BaseObject
    # ... existing fields ...

    field :my_favorites, [Types::TopupProductType], null: false do
      description "Get current user's favorite products"
    end

    def my_favorites
      user = context[:current_user]

      return [] unless user

      user.favorite_products.where(is_active: true)
    end
  end
end
```

### G. Register Mutations

```ruby
# app/graphql/types/mutation_type.rb
module Types
  class MutationType < Types::BaseObject
    # ... existing mutations ...

    field :add_favorite, mutation: Mutations::AddFavorite
    field :remove_favorite, mutation: Mutations::RemoveFavorite
  end
end
```

---

## 4. Performance Optimization (Optional but Recommended)

### Add Dataloader for batch loading favorites

```ruby
# app/graphql/sources/user_favorite.rb
module Sources
  class UserFavorite < GraphQL::Dataloader::Source
    def initialize(user_id)
      @user_id = user_id
    end

    def fetch(topup_product_ids)
      favorited_ids = ::UserFavorite
        .where(user_id: @user_id, topup_product_id: topup_product_ids)
        .pluck(:topup_product_id)
        .to_set

      topup_product_ids.map { |id| favorited_ids.include?(id) }
    end
  end
end
```

Then update TopupProductType:

```ruby
def is_favorite
  return false unless context[:current_user]

  dataloader.with(Sources::UserFavorite, context[:current_user].id).load(object.id)
end
```

---

## 5. Testing

```ruby
# spec/mutations/add_favorite_spec.rb
RSpec.describe Mutations::AddFavorite do
  let(:user) { create(:user) }
  let(:product) { create(:topup_product) }

  it "adds product to favorites" do
    result = execute_graphql(
      mutation: mutation,
      variables: { productId: product.id },
      context: { current_user: user }
    )

    expect(user.favorite_products).to include(product)
    expect(result["errors"]).to be_empty
  end
end
```

---

## 6. Migration Checklist

- [ ] Create database migration for `user_favorites` table
- [ ] Run migration: `rails db:migrate`
- [ ] Add `UserFavorite` model with associations
- [ ] Update `User` model with favorites associations
- [ ] Add `isFavorite` field to `TopupProductType`
- [ ] Create `AddFavorite` mutation
- [ ] Create `RemoveFavorite` mutation
- [ ] Add `myFavorites` query to `QueryType`
- [ ] Register mutations in `MutationType`
- [ ] Test mutations work correctly
- [ ] Deploy backend changes
- [ ] Update frontend GraphQL schema

---

## Next Steps

After implementing the backend:
1. Deploy backend changes
2. Run `npm run codegen` on frontend to regenerate types
3. The frontend code is ready and will work automatically!
