function iniciarApp() {
    const selectCategorias = document.querySelector("#categorias"); //index.html
    const favoritosDiv = document.querySelector(".favoritos"); //favoritos.html

    const resultado = document.querySelector("#resultado");
    const modal = new bootstrap.Modal("#modal");

    if(selectCategorias){
        selectCategorias.addEventListener("change", obtenerRecetaPorCategoria);
        obtenerCategorias()
    };

    if(favoritosDiv){
        obtenerFavoritos();
    };



    function obtenerCategorias() {
        const url = `https://www.themealdb.com/api/json/v1/1/categories.php`;
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories));
    };

    function mostrarCategorias(categorias = []){
        categorias.forEach(categoria => {

            const {strCategory : nombreCategoria} = categoria;

            const option = document.createElement("OPTION");
            option.value = nombreCategoria;
            option.textContent = nombreCategoria;
            
            selectCategorias.appendChild(option);
        });
    };

    function obtenerRecetaPorCategoria(e){
        const categoriaSeleccionada = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoriaSeleccionada}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaPorCategoria(resultado.meals));
    };

    function mostrarRecetaPorCategoria(recetas = []) {

        limpiarHTML(resultado);


        //Titulo condicional
        const heading = document.createElement("H2");
        heading.classList.add("text-center", "text-black", "my-5");
        heading.textContent = recetas.length ? "Results:" : "No results";
        resultado.appendChild(heading);

        //Iterar en resultados
        recetas.forEach(receta => {
            const {idMeal, strMeal, strMealThumb} = receta;

            //Card general. 
            const recetaContenedor = document.createElement("DIV");
            recetaContenedor.classList.add("col-md-4");

            const recetaCard = document.createElement("DIV");
            recetaCard.classList.add("card", "mb-4");


            //Componentes del card:

            //Card IMG
            const recetaImagen = document.createElement("IMG");
            recetaImagen.classList.add("card-img-top");
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.nombre}`;
            recetaImagen.src = strMealThumb ?? receta.foto;

            //Card BODY
            const recetaCardBody = document.createElement("DIV");
            recetaCardBody.classList.add("card-body");
            
            const recetaHeading = document.createElement("H3");
            recetaHeading.classList.add("card-title", "mb-3");
            recetaHeading.textContent = strMeal ?? receta.nombre;

            const recetaButton = document.createElement("BUTTON");
            recetaButton.classList.add("btn", "btn-danger", "w-100");
            recetaButton.textContent = "See";
            recetaButton.onclick = function(){
                seleccionarReceta(idMeal ?? receta.id);
            }

            //Inyectando todo el scripting
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard); //Resultado final
            resultado.appendChild(recetaContenedor);

        })
    };

    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    };

    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]));
    };

    function mostrarRecetaModal(receta){
        const { idMeal: id, strInstructions: instrucciones, strMeal: nombre, strMealThumb: foto, strYoutube: link} = receta;

        const modalTitle = document.querySelector(".modal .modal-title");
        const modalBody = document.querySelector(".modal .modal-body");
        modalTitle.textContent = nombre
        modalBody.innerHTML= `
            <img class= "img-fluid" src="${foto}" alt="receta ${nombre}"/>
            <h3 class="my-3 text-center border-bottom border-danger">Instructions</h3>
            <h5><a href="${link}" target="_blank" rel="noopener noreferrer" alt="Meal's video" class="d-block text-center text-info mb-3"> Link to Youtube</a></h5>


        `;

        //Añadir INSTRUCCIONES al modal.
        const listaInstrucciones = document.createElement("OL"); //Contenedor LI
        listaInstrucciones.classList.add("list-group-numbered");

        const instruccionesSeparadas = instrucciones.split(". ");
        instruccionesSeparadas.forEach( element => { //Añadiendo instrucciones al contenedor
            const instruccionesLi = document.createElement("LI");
            instruccionesLi.classList.add("list-group-item", "my-2");
            instruccionesLi.textContent = element;

            listaInstrucciones.appendChild(instruccionesLi);
        });
        modalBody.appendChild(listaInstrucciones);


        //Añadir CANTIDADES E INGREDIENTES al modal.
        const listaIngredientes = document.createElement("UL");
        listaIngredientes.classList.add("list-group", "list-group-flush");

        for(let i = 1; i <= 20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement("LI");
                ingredienteLi.classList.add("list-group-item", "text-center", "my-2");
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

                listaIngredientes.appendChild(ingredienteLi);
            };
        };
        modalBody.appendChild(listaIngredientes);

        //Botones de Cerrar y favoritos.
        const modalFooter = document.querySelector(".modal-footer");
        limpiarHTML(modalFooter);

        const btnFav = document.createElement("BUTTON");
        btnFav.classList.add("btn", "btn-danger", "col");
        btnFav.textContent = existeEnStorage(id) ? "Delete Fav" : "Save";
        btnFav.onclick = function () { //LocalStorage
            if (existeEnStorage(id)) {
                eliminarMealLocalStorage(id);
                btnFav.textContent = "Save"
                mostrarToast("Meal deleted 🗑️")
                return;
            }
            guardarMealLocalStorage({id, nombre, foto})
            btnFav.textContent = "Delete Fav";
            mostrarToast("Meal added ❤️")
        }
        const btnClose = document.createElement("BUTTON");
        btnClose.classList.add("btn", "btn-secondary", "col");
        btnClose.textContent = "Close";
        btnClose.dataset.bsDismiss = "modal";
        

        modalFooter.append(btnFav);
        modalFooter.append(btnClose);

        //Mostrar modal
        modal.show();
    };

    function guardarMealLocalStorage (receta){
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
        localStorage.setItem("favoritos", JSON.stringify([...favoritos, receta]));
    };

    function existeEnStorage(id){ //Retorna TRUE o FALSE si el Meal existe en LocalStorage
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    };

    function eliminarMealLocalStorage(id){
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));

        //Si esta en la ventana favoritos:
        if(favoritosDiv){
            obtenerFavoritos()
        }
    };

    function mostrarToast(msg){
        const toastDiv = document.querySelector("#toast");
        const toastBody = document.querySelector(".toast-body");

        const toast = new bootstrap.Toast(toastDiv)
        toastBody.textContent = msg
        
        toast.show()

    };

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
        if (favoritos.length) {
            mostrarRecetaPorCategoria(favoritos);
            return;
        }
        const noFavoritos = document.createElement("P");
        noFavoritos.textContent = "No favs here";
        noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5");
        favoritosDiv.appendChild(noFavoritos);
    }
};

document.addEventListener("DOMContentLoaded", iniciarApp)
