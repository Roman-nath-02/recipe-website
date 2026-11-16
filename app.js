const content = document.querySelector("#recipe-content");
const searchInput = document.querySelector("#recipe-search");
const categoryFilter = document.querySelector("#category-filter");
const browseSection = document.querySelector(".browse");
let recipes = [];
let currentImageIndex = 0;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function localRecipeImage(path) {
  if (typeof path !== "string" || !path.startsWith("assets/recipes/") || path.includes("..")) {
    return "";
  }
  return path;
}

function recipeMatches(recipe, query, category) {
  if (category && recipe.category !== category) return false;
  const searchable = [
    recipe.title,
    recipe.description,
    recipe.category,
    ...(recipe.tags || []),
    ...(recipe.ingredients || []).map((ingredient) => ingredient.name),
  ].join(" ").toLocaleLowerCase();
  return searchable.includes(query);
}

function renderCard(recipe) {
  const image = localRecipeImage((recipe.images || [])[0]);
  const labels = [
    recipe.category ? `<span class="category-label">${escapeHtml(recipe.category)}</span>` : "",
    recipe.featured ? '<span class="category-label featured-label">A little favorite</span>' : "",
  ].filter(Boolean).join("");
  const tags = (recipe.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

  return `
    <article class="recipe-card">
      ${image ? `<img class="card-image" src="${escapeHtml(image)}" alt="${escapeHtml(recipe.title)}" loading="lazy">` : ""}
      <div class="card-body">
        <div class="card-meta">${labels}</div>
        <h3><a href="#recipe/${encodeURIComponent(recipe.id)}">${escapeHtml(recipe.title)}</a></h3>
        ${recipe.description ? `<p class="card-description">${escapeHtml(recipe.description)}</p>` : ""}
        ${recipe.cookingTime ? `<p class="card-time">◷ ${escapeHtml(recipe.cookingTime)}</p>` : ""}
        ${tags ? `<div class="tag-list" aria-label="Tags">${tags}</div>` : ""}
      </div>
    </article>`;
}

function renderList() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const category = categoryFilter.value;
  const matching = recipes.filter((recipe) => recipeMatches(recipe, query, category));
  const featured = matching.filter((recipe) => recipe.featured);
  const regular = matching.filter((recipe) => !recipe.featured);

  browseSection.classList.remove("detail-mode");
  searchInput.closest(".filters").hidden = false;

  if (!recipes.length) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-mark" aria-hidden="true">✳</div>
        <h2>Your recipe box is ready.</h2>
        <p>There aren't any recipes here yet. Add a recipe file and its own kitchen photos to get started.</p>
        <p><a href="README.md#adding-recipes">See how to add your first recipe</a></p>
      </div>`;
    return;
  }

  if (!matching.length) {
    content.innerHTML = `
      <div class="empty-state">
        <h2>No recipes found</h2>
        <p>Try another search or choose a different category.</p>
      </div>`;
    return;
  }

  const count = `${matching.length} ${matching.length === 1 ? "recipe" : "recipes"}`;
  content.innerHTML = `
    ${featured.length ? `
      <section aria-labelledby="featured-title">
        <div class="section-heading"><h2 id="featured-title">A few favorites</h2></div>
        <div class="recipe-grid">${featured.map(renderCard).join("")}</div>
      </section>` : ""}
    <section aria-labelledby="all-recipes-title">
      <div class="section-heading">
        <h2 id="all-recipes-title">${featured.length ? "The recipe box" : "Recipes"}</h2>
        <p class="result-count">${count}</p>
      </div>
      <div class="recipe-grid">${regular.map(renderCard).join("")}</div>
    </section>`;
}

function renderGallery(recipe) {
  const images = (recipe.images || []).map(localRecipeImage).filter(Boolean);
  if (!images.length) return "";
  const controls = images.length > 1 ? `
    <div class="gallery-controls" aria-label="Photo gallery controls">
      <button type="button" data-gallery-step="-1" aria-label="Previous photo">←</button>
      <span id="gallery-position" aria-live="polite">Photo 1 of ${images.length}</span>
      <button type="button" data-gallery-step="1" aria-label="Next photo">→</button>
    </div>` : "";
  return `
    <figure class="gallery">
      <img class="gallery-image" id="gallery-image" src="${escapeHtml(images[0])}" alt="${escapeHtml(recipe.title)}">
      ${controls}
    </figure>`;
}

function renderDetail(recipe) {
  const ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];
  const tags = (recipe.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

  browseSection.classList.add("detail-mode");
  searchInput.closest(".filters").hidden = true;
  content.innerHTML = `
    <a class="detail-back" href="#">← Back to the recipe box</a>
    <article class="recipe-detail">
      <header class="detail-heading">
        <div class="card-meta">
          ${recipe.category ? `<span class="category-label">${escapeHtml(recipe.category)}</span>` : ""}
          ${recipe.featured ? '<span class="category-label featured-label">A little favorite</span>' : ""}
        </div>
        <h2>${escapeHtml(recipe.title)}</h2>
        ${recipe.description ? `<p class="detail-description">${escapeHtml(recipe.description)}</p>` : ""}
        <div class="detail-meta">
          ${recipe.cookingTime ? `<span class="category-label">◷ ${escapeHtml(recipe.cookingTime)}</span>` : ""}
          ${tags}
        </div>
      </header>
      ${renderGallery(recipe)}
      <div class="detail-columns">
        ${ingredients.length ? `
          <section class="detail-section" aria-labelledby="ingredients-title">
            <h3 id="ingredients-title">Ingredients</h3>
            <ul class="ingredient-list">${ingredients.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : [item.amount, item.name].filter(Boolean).join(" "))}</li>`).join("")}</ul>
          </section>` : ""}
        ${instructions.length ? `
          <section class="detail-section" aria-labelledby="instructions-title">
            <h3 id="instructions-title">How to make it</h3>
            <ol class="instruction-list">${instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          </section>` : ""}
      </div>
      ${recipe.notes ? `
        <section class="detail-section" aria-labelledby="notes-title">
          <h3 id="notes-title">Notes</h3>
          <div class="notes"><p>${escapeHtml(recipe.notes)}</p></div>
        </section>` : ""}
    </article>`;
  currentImageIndex = 0;
}

function renderRoute() {
  const match = window.location.hash.match(/^#recipe\/(.+)$/);
  if (!match) {
    renderList();
    return;
  }

  let recipeId;
  try {
    recipeId = decodeURIComponent(match[1]);
  } catch {
    renderList();
    return;
  }

  const recipe = recipes.find((item) => item.id === recipeId);
  if (!recipe) {
    window.location.hash = "";
    renderList();
    return;
  }
  renderDetail(recipe);
}

function updateCategories() {
  const selected = categoryFilter.value;
  const categories = [...new Set(recipes.map((recipe) => recipe.category).filter(Boolean))].sort();
  categoryFilter.innerHTML = `<option value="">All categories</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
  categoryFilter.value = categories.includes(selected) ? selected : "";
}

async function loadRecipes() {
  try {
    const response = await fetch("recipes/index.json");
    if (!response.ok) throw new Error(`Could not load recipe index (${response.status}).`);
    const entries = await response.json();
    if (!Array.isArray(entries)) throw new Error("Recipe index must contain a list of recipe file paths.");
    const paths = entries.filter((path) => typeof path === "string" && /^recipes\/[a-z0-9-]+\.json$/i.test(path));
    const loaded = await Promise.all(paths.map(async (path) => {
      const recipeResponse = await fetch(path);
      if (!recipeResponse.ok) throw new Error(`Could not load ${path} (${recipeResponse.status}).`);
      return recipeResponse.json();
    }));
    recipes = loaded.filter((recipe) => recipe && typeof recipe.id === "string" && typeof recipe.title === "string");
    updateCategories();
    content.setAttribute("aria-busy", "false");
    renderRoute();
  } catch (error) {
    content.setAttribute("aria-busy", "false");
    content.innerHTML = `
      <div class="error-state" role="alert">
        <h2>We couldn't open the recipe box.</h2>
        <p>${escapeHtml(error.message)}</p>
        <p>Open this site through a local web server so the browser can read its recipe files.</p>
      </div>`;
  }
}

searchInput.addEventListener("input", renderList);
categoryFilter.addEventListener("change", renderList);
window.addEventListener("hashchange", renderRoute);
content.addEventListener("click", (event) => {
  const button = event.target.closest("[data-gallery-step]");
  if (!button) return;
  const recipeId = decodeURIComponent(window.location.hash.slice("#recipe/".length));
  const recipe = recipes.find((item) => item.id === recipeId);
  const images = recipe ? (recipe.images || []).map(localRecipeImage).filter(Boolean) : [];
  if (images.length < 2) return;
  currentImageIndex = (currentImageIndex + Number(button.dataset.galleryStep) + images.length) % images.length;
  document.querySelector("#gallery-image").src = images[currentImageIndex];
  document.querySelector("#gallery-position").textContent = `Photo ${currentImageIndex + 1} of ${images.length}`;
});

loadRecipes();
