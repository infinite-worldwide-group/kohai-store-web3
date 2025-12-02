import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const baseImageUrl = "https://kohai-indonesia-production-bucket.s3.ap-southeast-1.amazonaws.com/";

const products = [
  {
    name: "ZZZ",
    brand: "HoyoVerse",
    image: `${baseImageUrl}xmsnmwt5y35pzima2gzqweuu91ij`,
    link: "/panel/product/ace-racer",
  },
  {
    name: "Honor Of King",
    brand: "TenCent",
    image: `${baseImageUrl}g7jxdf5a4tw42jn0js8bxh7d4ei1`,
    link: "/panel/product/game-x",
  },
  {
    name: "Genshin Impact",
    brand: "HoyoVerse",
    image: `${baseImageUrl}fxqubbvtlu9fkl856441839srl2o`,
    link: "/panel/product/game-y",
  },
    {
    name: "AceRacer",
    brand: "NetEase",
    image: `${baseImageUrl}wh0hd6nsd6ddw7n2xj8kaxyxbgso`,
    link: "/panel/product/game-y",
  },
  {
    name: "TFT",
    brand: "Riot Games",
    image: `${baseImageUrl}oglo0exqmwi9wxnxzqkazlzv127q`,
    link: "/panel/product/game-y",
  },
  { 
    name: "Mobile Legends",
    brand: "TenCent",
    image: `${baseImageUrl}znic713eau4jt8b3cg2jiigeaxd1`,
    link: "/panel/product/game-y",
  },
  { 
    name: "Valorant",
    brand: "Riot Games",
    image: `${baseImageUrl}ghsaelka5owltyw93zpfj2lv680e`,
    link: "/panel/product/game-y",
  },
  { 
    name: "Free Fire Max",
    brand: "Garena",
    image: `${baseImageUrl}po53bkv3xc9z4y7d0y3r82edtiq7`,
    link: "/panel/product/game-y",
  },
  { 
    name: "Eggy Party",
    brand: "NetEase",
    image: `${baseImageUrl}2vrmw5iujxujcpd2b3g6iqqiep9s`,
    link: "/panel/product/game-y",
  },
  { 
    name: "COD: Mobile",
    brand: "Level Infinite",
    image: `${baseImageUrl}nu09wrzwqpyx436cixl2nbq8uyyz`,
    link: "/panel/product/game-y",
  },
  { 
    name: "COD: Mobile",
    brand: "Level Infinite",
    image: `${baseImageUrl}rxw4vnwuiqpxrrj5f4f6z9ig8vet`,
    link: "/panel/product/game-y",
  },
  { 
    name: "Arena Of Valor",
    brand: "TenCent",
    image: `${baseImageUrl}u8o7kwj320qfh40ku79r1nhrfdil`,
    link: "/panel/product/game-y",
  },
  { 
    name: "Tarisland",
    brand: "Level Infinite",
    image: `${baseImageUrl}ick95xtxzx6zfl7kmb3710l6pp0l`,
    link: "/panel/product/game-y",
  },
  { 
    name: "The Ants: Underground Kingdom",
    brand: "StarUnion",
    image: `${baseImageUrl}ia6z7peumyfnyhwtnquclximn8x7`,
    link: "/panel/product/game-y",
  },
  { 
    name: "The Lord Of Ring",
    brand: "NetEase",
    image: `${baseImageUrl}qbqayope7qt6mpc4qf6o16k2x50z`,
    link: "/panel/product/game-y",
  },
];

const Product = () => {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 container mx-auto px-4 py-8">
        <Breadcrumb pageName="Product" />
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Product Page
        </h1>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {products.map((product, index) => (
            <a
              href={product.link}
              key={index}
              className="block p-4 border rounded-lg shadow-md hover:shadow-lg transition bg-white dark:bg-gray-800"
            >
              <div className="mb-4">
                <img
                  src={product.image || "https://via.placeholder.com/100"}
                  alt={`${product.name} icon`}
                  className="w-full h-50 object-cover rounded-md" //adjust height of picture 
                />
              </div>
              <h5 className="text-lg font-semibold text-black dark:text-white">
                {product.name}
              </h5>
              <p className="text-gray-500 dark:text-gray-400">{product.brand}</p>
            </a>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Product;
