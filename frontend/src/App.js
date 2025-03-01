import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/products/")
        .then(response => setProducts(response.data))
        .catch(error => console.error("Error fetching products:", error));
  }, []);

  return (
    <div>
	<h1>Danh sách sản phẩm</h1>
	<ul>
	   {products.map(product => (
	       <li key={product.id}>
		   <h3>{product.name}</h3>
		   <p>Giá: {product.price} VND</p>
		   <p>{product.description}</p>
	       </li>
	   ))}
	</ul>
     </div>
  );
}

export default App;
