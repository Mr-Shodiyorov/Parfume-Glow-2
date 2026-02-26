import React from "react";
import { useGetProductsQuery } from "./app/services/authApi";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Admin from "./pages/admin/Admin";
import ProductDetail from "./pages/productDetails/ProductDetails";
import Basket from "./pages/items/Basket";
import Products from "./pages/products/Products";
// import { useGetProductsMutation } from './app/services/authApi';

function App() {
  // console.log(data);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adm" element={<Admin />} />
          <Route path="/details/:id" element={<ProductDetail />} />
          <Route path="/basket" element={<Basket />} />
          <Route path="/products" element={<Products/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
