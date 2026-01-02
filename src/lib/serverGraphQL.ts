/**
 * Server-side GraphQL client for API routes
 * This allows us to call GraphQL mutations from Next.js API routes
 */

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

/**
 * Make a GraphQL request from the server
 * @param query - GraphQL query/mutation string
 * @param variables - Variables for the query
 * @param jwtToken - Optional JWT token for authentication
 */
export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>,
  jwtToken?: string
): Promise<GraphQLResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    }

    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const result: GraphQLResponse<T> = await response.json();
    return result;
  } catch (error: any) {
    console.error('GraphQL request error:', error);
    return {
      errors: [{
        message: error.message || 'GraphQL request failed',
      }],
    };
  }
}

/**
 * Create an order via GraphQL mutation (server-side)
 */
export async function createOrderServerSide(params: {
  topupProductItemId: string;
  transactionSignature: string;
  userData?: Record<string, any>;
  cryptoCurrency?: string;
  cryptoAmount?: number;
  jwtToken?: string;
}): Promise<{
  success: boolean;
  order?: any;
  errors?: string[];
}> {
  const mutation = `
    mutation CreateOrder(
      $topupProductItemId: ID!
      $transactionSignature: String!
      $userData: JSON
      $cryptoCurrency: String
      $cryptoAmount: Float
    ) {
      createOrder(
        topupProductItemId: $topupProductItemId
        transactionSignature: $transactionSignature
        userData: $userData
        cryptoCurrency: $cryptoCurrency
        cryptoAmount: $cryptoAmount
      ) {
        errors
        order {
          id
          orderNumber
          amount
          currency
          status
          orderType
          metadata
          createdAt
          updatedAt
          cryptoTransaction {
            id
            amount
            token
            network
            transactionSignature
            transactionType
            confirmations
            state
            direction
            createdAt
          }
        }
      }
    }
  `;

  const result = await graphqlRequest(mutation, {
    topupProductItemId: params.topupProductItemId,
    transactionSignature: params.transactionSignature,
    userData: params.userData,
    cryptoCurrency: params.cryptoCurrency,
    cryptoAmount: params.cryptoAmount,
  }, params.jwtToken);

  if (result.errors && result.errors.length > 0) {
    console.error('GraphQL errors:', result.errors);
    return {
      success: false,
      errors: result.errors.map(e => e.message),
    };
  }

  const createOrderResult = result.data?.createOrder;

  if (!createOrderResult) {
    return {
      success: false,
      errors: ['No response from server'],
    };
  }

  if (createOrderResult.errors && createOrderResult.errors.length > 0) {
    return {
      success: false,
      errors: createOrderResult.errors,
    };
  }

  return {
    success: true,
    order: createOrderResult.order,
    errors: [],
  };
}
