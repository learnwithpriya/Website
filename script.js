let products = [];
let filteredProducts = [];
let currentProduct = null;


function parseCSV(csv) {

const lines = csv.trim().split("\n");
const headers = lines[0].split(",");

return lines.slice(1).map(line => {

const values = line.split(",");
let obj = {};

headers.forEach((h,i)=>obj[h.trim()]=values[i]);

return obj;

});

}



async function fetchProducts(){

const response = await fetch("Product.csv");

const csv = await response.text();

products = parseCSV(csv);

filteredProducts = [...products];

renderProducts(filteredProducts);

}



function renderProducts(list){

const grid = document.getElementById("product-grid");

grid.innerHTML="";

list.forEach((product,index)=>{

const card=document.createElement("div");

card.className="bg-white p-4 rounded shadow cursor-pointer";

card.innerHTML=`

<h3 class="font-bold text-lg">${product.name}</h3>

<p class="text-gray-500">${product.category}</p>

<p class="text-sm">Beam: ${product.beam_angle}</p>

<p class="text-sm">IP${product.ip_rating} IK${product.ik_rating}</p>

`;

card.onclick=()=>openProductModal(index);

grid.appendChild(card);

});

}



function openProductModal(index){

currentProduct = products[index];

document.getElementById("modal-product-name").innerText=currentProduct.name;

document.getElementById("modal-product-description").innerText=currentProduct.description;

document.getElementById("modal-specifications").innerHTML=`

<p><b>Category:</b> ${currentProduct.category}</p>

<p><b>Size:</b> ${currentProduct.size}</p>

<p><b>Beam:</b> ${currentProduct.beam_angle}</p>

<p><b>Lens:</b> ${currentProduct.lens_type}</p>

<p><b>CCT:</b> ${currentProduct.cct}</p>

<p><b>IP:</b> ${currentProduct.ip_rating}</p>

<p><b>IK:</b> ${currentProduct.ik_rating}</p>

`;

document.getElementById("product-modal").classList.remove("hidden");

simulateBeam();

}



function closeProductModal(){

document.getElementById("product-modal").classList.add("hidden");

}



function simulateBeam(){

const canvas=document.getElementById("beamCanvas");

const ctx=canvas.getContext("2d");

const angle=document.getElementById("beamSelect").value;

ctx.clearRect(0,0,300,300);

ctx.beginPath();

ctx.moveTo(150,20);

ctx.lineTo(150-angle*1.2,250);

ctx.lineTo(150+angle*1.2,250);

ctx.closePath();

ctx.fillStyle="rgba(255,200,50,0.6)";

ctx.fill();

}



document.getElementById("product-search").addEventListener("input",e=>{

const term=e.target.value.toLowerCase();

filteredProducts=products.filter(p=>p.name.toLowerCase().includes(term));

renderProducts(filteredProducts);

});



document.addEventListener("DOMContentLoaded",fetchProducts);
