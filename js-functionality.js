// JavaScript функционал для CRM "Повар Бим" - Производство

// Глобальные переменные для хранения данных
let ingredients = [];
let recipes = [];
let productionTasks = [];
let packagingMaterials = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadSampleData();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    showSection('dashboard');
    updateDashboardStats();
});

// Обновление времени
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleString('ru-RU');
}

// Функции управления разделами
function showSection(sectionName) {
    // Скрыть все секции
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    // Показать выбранную секцию
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('fade-in');
    }

    // Обновить активный элемент меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeMenuItem = document.querySelector(`[onclick*="${sectionName}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }

    // Загрузить данные для секции
    switch (sectionName) {
        case 'ingredients':
            loadIngredients();
            break;
        case 'recipes':
            loadRecipes();
            break;
        case 'production':
            loadProductionTasks();
            break;
        case 'packaging':
            loadPackagingMaterials();
            break;
        case 'dashboard':
            updateDashboardStats();
            break;
    }
}

// Функции управления модальными окнами
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        
        // Сброс формы при открытии модального окна
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            // Очистка скрытых полей ID
            const idField = form.querySelector('input[type="hidden"]');
            if (idField) idField.value = '';
        }

        // Специфическая инициализация для разных модальных окон
        if (modalId === 'recipe-modal') {
            clearRecipeIngredients();
            loadIngredientsForRecipe();
        }
        if (modalId === 'production-task-modal') {
            loadRecipesForProduction();
            setDefaultProductionDate();
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// УПРАВЛЕНИЕ ИНГРЕДИЕНТАМИ
function saveIngredient(event) {
    event.preventDefault();

    const formData = {
        id: document.getElementById('ingredient-id').value || Date.now().toString(),
        name: document.getElementById('ingredient-name').value,
        category: document.getElementById('ingredient-category').value,
        stock: parseFloat(document.getElementById('ingredient-stock').value),
        price: parseFloat(document.getElementById('ingredient-price').value),
        minStock: parseFloat(document.getElementById('ingredient-min-stock').value) || 0,
        supplier: document.getElementById('ingredient-supplier').value,
        description: document.getElementById('ingredient-description').value,
        createdAt: new Date().toISOString()
    };

    // Проверка на существующий ингредиент
    const existingIndex = ingredients.findIndex(ing => ing.id === formData.id);
    if (existingIndex >= 0) {
        ingredients[existingIndex] = formData;
    } else {
        ingredients.push(formData);
    }

    // Сохранение в localStorage
    saveDataToStorage();

    hideModal('ingredient-modal');
    loadIngredients();
    updateDashboardStats();

    showNotification('Ингредиент успешно сохранен', 'success');
}

function loadIngredients() {
    const tbody = document.getElementById('ingredients-table');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (ingredients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-seedling text-4xl mb-3"></i>
                    <p>Нет добавленных ингредиентов</p>
                    <button onclick="showModal('ingredient-modal')" 
                            class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        <i class="fas fa-plus mr-2"></i>
                        Добавить первый ингредиент
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    ingredients.forEach(ingredient => {
        const status = getIngredientStatus(ingredient);
        const row = `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${ingredient.name}</div>
                    <div class="text-sm text-gray-500">${ingredient.description || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ${ingredient.category}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${ingredient.stock} кг</div>
                    ${ingredient.minStock > 0 ? `<div class="text-xs text-gray-500">Мин: ${ingredient.minStock} кг</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${ingredient.price.toFixed(2)} ₽
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center ${status.class}">
                        <i class="fas ${status.icon} mr-1"></i>
                        ${status.text}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="editIngredient('${ingredient.id}')" 
                            class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteIngredient('${ingredient.id}')" 
                            class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function getIngredientStatus(ingredient) {
    if (ingredient.stock <= 0) {
        return {
            class: 'status-unavailable',
            icon: 'fa-times-circle',
            text: 'Нет на складе'
        };
    } else if (ingredient.minStock > 0 && ingredient.stock <= ingredient.minStock) {
        return {
            class: 'text-yellow-600',
            icon: 'fa-exclamation-triangle',
            text: 'Заканчивается'
        };
    } else {
        return {
            class: 'status-available',
            icon: 'fa-check-circle',
            text: 'Есть на складе'
        };
    }
}

function editIngredient(id) {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (!ingredient) return;

    // Заполнить форму данными ингредиента
    document.getElementById('ingredient-id').value = ingredient.id;
    document.getElementById('ingredient-name').value = ingredient.name;
    document.getElementById('ingredient-category').value = ingredient.category;
    document.getElementById('ingredient-stock').value = ingredient.stock;
    document.getElementById('ingredient-price').value = ingredient.price;
    document.getElementById('ingredient-min-stock').value = ingredient.minStock;
    document.getElementById('ingredient-supplier').value = ingredient.supplier || '';
    document.getElementById('ingredient-description').value = ingredient.description || '';

    document.getElementById('ingredient-modal-title').textContent = 'Редактировать ингредиент';
    showModal('ingredient-modal');
}

function deleteIngredient(id) {
    if (confirm('Вы уверены, что хотите удалить этот ингредиент?')) {
        ingredients = ingredients.filter(ing => ing.id !== id);
        saveDataToStorage();
        loadIngredients();
        updateDashboardStats();
        showNotification('Ингредиент удален', 'success');
    }
}

// УПРАВЛЕНИЕ РЕЦЕПТАМИ
function saveRecipe(event) {
    event.preventDefault();

    const recipeIngredients = getRecipeIngredients();
    if (recipeIngredients.length === 0) {
        alert('Добавьте хотя бы один ингредиент в рецепт');
        return;
    }

    const formData = {
        id: document.getElementById('recipe-id').value || Date.now().toString(),
        name: document.getElementById('recipe-name').value,
        category: document.getElementById('recipe-category').value,
        description: document.getElementById('recipe-description').value,
        ingredients: recipeIngredients,
        totalWeight: calculateRecipeTotalWeight(recipeIngredients),
        totalCost: calculateRecipeTotalCost(recipeIngredients),
        createdAt: new Date().toISOString()
    };

    const existingIndex = recipes.findIndex(recipe => recipe.id === formData.id);
    if (existingIndex >= 0) {
        recipes[existingIndex] = formData;
    } else {
        recipes.push(formData);
    }

    saveDataToStorage();
    hideModal('recipe-modal');
    loadRecipes();
    updateDashboardStats();

    showNotification('Рецепт успешно сохранен', 'success');
}

function loadRecipes() {
    const grid = document.getElementById('recipes-grid');
    const empty = document.getElementById('recipes-empty');

    if (!grid || !empty) return;

    if (recipes.length === 0) {
        grid.style.display = 'none';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    grid.style.display = 'grid';
    grid.innerHTML = '';

    recipes.forEach(recipe => {
        const card = `
            <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">${recipe.name}</h3>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${recipe.category}
                        </span>
                    </div>

                    <p class="text-sm text-gray-600 mb-4">${recipe.description || 'Описание отсутствует'}</p>

                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Ингредиентов:</span>
                            <span class="font-medium">${recipe.ingredients.length}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Общий вес:</span>
                            <span class="font-medium">${recipe.totalWeight} г</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Себестоимость:</span>
                            <span class="font-medium text-green-600">${recipe.totalCost.toFixed(2)} ₽</span>
                        </div>
                    </div>

                    <div class="flex justify-between">
                        <button onclick="viewRecipe('${recipe.id}')" 
                                class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            <i class="fas fa-eye mr-1"></i>
                            Просмотр
                        </button>
                        <div class="space-x-2">
                            <button onclick="editRecipe('${recipe.id}')" 
                                    class="text-orange-600 hover:text-orange-900 text-sm">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteRecipe('${recipe.id}')" 
                                    class="text-red-600 hover:text-red-900 text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// КОНСТРУКТОР РЕЦЕПТОВ
function loadIngredientsForRecipe() {
    // Функция для загрузки ингредиентов в селект конструктора рецептов
    // Будет вызываться при открытии модального окна рецепта
}

function addIngredientToRecipe() {
    if (ingredients.length === 0) {
        alert('Сначала добавьте ингредиенты в систему');
        return;
    }

    const ingredientsContainer = document.getElementById('recipe-ingredients');
    const ingredientId = `recipe-ingredient-${Date.now()}`;

    const ingredientRow = `
        <div class="ingredient-row" data-id="${ingredientId}">
            <div class="flex items-center space-x-4">
                <div class="flex-1">
                    <select class="ingredient-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            onchange="updateRecipeCalculations()">
                        <option value="">Выберите ингредиент</option>
                        ${ingredients.map(ing => `
                            <option value="${ing.id}" data-price="${ing.price}" data-stock="${ing.stock}">
                                ${ing.name} (${ing.stock} кг на складе, ${ing.price} ₽/кг)
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="w-32">
                    <input type="number" step="0.1" min="0" placeholder="Вес (г)" 
                           class="ingredient-weight w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           onchange="updateRecipeCalculations()">
                </div>
                <div class="w-24 text-sm text-gray-600 text-center">
                    <span class="ingredient-cost">0 ₽</span>
                </div>
                <button type="button" onclick="removeIngredientFromRecipe('${ingredientId}')" 
                        class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    ingredientsContainer.innerHTML += ingredientRow;
}

function removeIngredientFromRecipe(ingredientId) {
    const element = document.querySelector(`[data-id="${ingredientId}"]`);
    if (element) {
        element.remove();
        updateRecipeCalculations();
    }
}

function clearRecipeIngredients() {
    document.getElementById('recipe-ingredients').innerHTML = '';
    updateRecipeCalculations();
}

function updateRecipeCalculations() {
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    let totalWeight = 0;
    let totalCost = 0;

    ingredientRows.forEach(row => {
        const select = row.querySelector('.ingredient-select');
        const weightInput = row.querySelector('.ingredient-weight');
        const costSpan = row.querySelector('.ingredient-cost');

        const selectedOption = select.selectedOptions[0];
        const weight = parseFloat(weightInput.value) || 0;

        if (selectedOption && selectedOption.value && weight > 0) {
            const price = parseFloat(selectedOption.dataset.price) || 0;
            const cost = (weight / 1000) * price; // вес в граммах, цена за кг

            costSpan.textContent = cost.toFixed(2) + ' ₽';
            totalWeight += weight;
            totalCost += cost;
        } else {
            costSpan.textContent = '0 ₽';
        }
    });

    document.getElementById('recipe-total-weight').textContent = totalWeight + ' г';
    document.getElementById('recipe-total-cost').textContent = totalCost.toFixed(2) + ' ₽';
    document.getElementById('recipe-cost-per-kg').textContent = totalCost.toFixed(2) + ' ₽';
}

function getRecipeIngredients() {
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    const recipeIngredients = [];

    ingredientRows.forEach(row => {
        const select = row.querySelector('.ingredient-select');
        const weightInput = row.querySelector('.ingredient-weight');

        const ingredientId = select.value;
        const weight = parseFloat(weightInput.value) || 0;

        if (ingredientId && weight > 0) {
            const ingredient = ingredients.find(ing => ing.id === ingredientId);
            if (ingredient) {
                recipeIngredients.push({
                    ingredientId: ingredientId,
                    name: ingredient.name,
                    weight: weight,
                    price: ingredient.price,
                    cost: (weight / 1000) * ingredient.price
                });
            }
        }
    });

    return recipeIngredients;
}

function calculateRecipeTotalWeight(ingredients) {
    return ingredients.reduce((total, ing) => total + ing.weight, 0);
}

function calculateRecipeTotalCost(ingredients) {
    return ingredients.reduce((total, ing) => total + ing.cost, 0);
}

// ПРОИЗВОДСТВЕННЫЕ ЗАДАНИЯ
function loadRecipesForProduction() {
    const select = document.getElementById('production-recipe-select');
    if (!select) return;

    select.innerHTML = '<option value="">Выберите рецепт из базы</option>';
    
    recipes.forEach(recipe => {
        const option = `<option value="${recipe.id}">${recipe.name} (${recipe.category})</option>`;
        select.innerHTML += option;
    });
}

function setDefaultProductionDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('production-date').value = today;
}

function updateProductionCalculations() {
    const recipeId = document.getElementById('production-recipe-select').value;
    const batchSize = parseFloat(document.getElementById('production-batch-size').value) || 0;

    const calculationDiv = document.getElementById('production-ingredients-calculation');
    const warningsDiv = document.getElementById('production-availability-check');

    if (!recipeId || batchSize <= 0) {
        calculationDiv.classList.add('hidden');
        warningsDiv.classList.add('hidden');
        return;
    }

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    calculationDiv.classList.remove('hidden');

    // Расчет ингредиентов для партии
    const ingredientsList = document.getElementById('production-ingredients-list');
    let totalCost = 0;
    let warnings = [];

    ingredientsList.innerHTML = '';

    recipe.ingredients.forEach(recipeIng => {
        const ingredient = ingredients.find(ing => ing.id === recipeIng.ingredientId);
        if (!ingredient) return;

        const neededWeight = (recipeIng.weight * batchSize) / 1000; // в кг
        const ingredientCost = neededWeight * ingredient.price;
        totalCost += ingredientCost;

        // Проверка наличия на складе
        let statusClass = 'text-green-600';
        let statusIcon = 'fa-check-circle';
        let statusText = 'Достаточно';

        if (neededWeight > ingredient.stock) {
            statusClass = 'text-red-600';
            statusIcon = 'fa-times-circle';
            statusText = 'Недостаточно';
            warnings.push({
                ingredient: ingredient.name,
                needed: neededWeight,
                available: ingredient.stock
            });
        } else if (neededWeight > (ingredient.stock * 0.8)) {
            statusClass = 'text-yellow-600';
            statusIcon = 'fa-exclamation-triangle';
            statusText = 'Близко к минимуму';
        }

        const row = `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                    <div class="font-medium text-gray-900">${ingredient.name}</div>
                    <div class="text-sm text-gray-600">
                        Нужно: ${neededWeight.toFixed(2)} кг | 
                        На складе: ${ingredient.stock} кг |
                        Цена: ${ingredient.price} ₽/кг
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-medium text-gray-900">${ingredientCost.toFixed(2)} ₽</div>
                    <div class="text-sm ${statusClass}">
                        <i class="fas ${statusIcon} mr-1"></i>
                        ${statusText}
                    </div>
                </div>
            </div>
        `;
        ingredientsList.innerHTML += row;
    });

    // Обновление итоговой стоимости
    document.getElementById('production-total-cost').textContent = totalCost.toFixed(2) + ' ₽';
    document.getElementById('production-cost-per-kg').textContent = (totalCost / batchSize).toFixed(2) + ' ₽';

    // Показать предупреждения
    if (warnings.length > 0) {
        warningsDiv.classList.remove('hidden');
        const warningsList = document.getElementById('production-warnings');
        warningsList.innerHTML = '';

        warnings.forEach(warning => {
            const warningItem = `
                <div class="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <i class="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                    <div>
                        <div class="font-medium text-red-900">${warning.ingredient}</div>
                        <div class="text-sm text-red-700">
                            Требуется: ${warning.needed.toFixed(2)} кг, доступно: ${warning.available} кг
                        </div>
                    </div>
                </div>
            `;
            warningsList.innerHTML += warningItem;
        });
    } else {
        warningsDiv.classList.add('hidden');
    }
}

function generateBatchNumber() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Найти максимальный номер партии на сегодня
    const todayBatches = productionTasks.filter(task => 
        task.batchNumber && task.batchNumber.startsWith(dateStr)
    );
    
    let maxNumber = 0;
    todayBatches.forEach(task => {
        const numberMatch = task.batchNumber.match(/(\d+)$/);
        if (numberMatch) {
            maxNumber = Math.max(maxNumber, parseInt(numberMatch[1]));
        }
    });

    const newBatchNumber = dateStr + '-' + String(maxNumber + 1).padStart(3, '0');
    document.getElementById('production-batch-number').value = newBatchNumber;
}

function saveProductionTask(event) {
    event.preventDefault();

    const recipeId = document.getElementById('production-recipe-select').value;
    const batchSize = parseFloat(document.getElementById('production-batch-size').value);
    let batchNumber = document.getElementById('production-batch-number').value;

    if (!batchNumber) {
        generateBatchNumber();
        batchNumber = document.getElementById('production-batch-number').value;
    }

    // Проверка дублирования номера партии
    const existingBatch = productionTasks.find(task => task.batchNumber === batchNumber);
    if (existingBatch) {
        const confirmOverride = confirm(`Партия с номером ${batchNumber} уже существует. Сгенерировать новый номер?`);
        if (confirmOverride) {
            generateBatchNumber();
            batchNumber = document.getElementById('production-batch-number').value;
        } else {
            return;
        }
    }

    const recipe = recipes.find(r => r.id === recipeId);
    const totalCost = parseFloat(document.getElementById('production-total-cost').textContent.replace(' ₽', ''));

    const taskData = {
        id: document.getElementById('production-task-id').value || Date.now().toString(),
        recipeId: recipeId,
        recipeName: recipe.name,
        batchSize: batchSize,
        batchNumber: batchNumber,
        productionDate: document.getElementById('production-date').value,
        totalCost: totalCost,
        costPerKg: totalCost / batchSize,
        status: 'in-production',
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString()
    };

    // Списание ингредиентов со склада
    recipe.ingredients.forEach(recipeIng => {
        const ingredient = ingredients.find(ing => ing.id === recipeIng.ingredientId);
        if (ingredient) {
            const neededWeight = (recipeIng.weight * batchSize) / 1000; // в кг
            ingredient.stock = Math.max(0, ingredient.stock - neededWeight);
        }
    });

    const existingIndex = productionTasks.findIndex(task => task.id === taskData.id);
    if (existingIndex >= 0) {
        productionTasks[existingIndex] = taskData;
    } else {
        productionTasks.push(taskData);
    }

    saveDataToStorage();
    hideModal('production-task-modal');
    loadProductionTasks();
    loadIngredients(); // Обновить остатки ингредиентов
    updateDashboardStats();

    showNotification('Производственное задание запущено', 'success');

    // Показать модальное окно экспорта
    showExportModal(taskData);
}

function saveProductionTaskAsDraft() {
    // Логика сохранения как черновик
    const taskData = {
        // ... аналогично saveProductionTask, но статус 'draft'
        status: 'draft'
    };
    // Без списания ингредиентов
    showNotification('Задание сохранено как черновик', 'info');
}

function loadProductionTasks() {
    const tbody = document.getElementById('production-table');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (productionTasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-cogs text-4xl mb-3"></i>
                    <p>Нет производственных заданий</p>
                    <button onclick="showModal('production-task-modal')" 
                            class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                        <i class="fas fa-plus mr-2"></i>
                        Создать первое задание
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    productionTasks.forEach(task => {
        const status = getProductionStatus(task);
        const row = `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${task.batchNumber}</div>
                    <div class="text-sm text-gray-500">${task.recipeName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${task.batchSize} кг
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(task.productionDate).toLocaleDateString('ru-RU')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${task.totalCost.toFixed(2)} ₽</div>
                    <div class="text-xs text-gray-500">${task.costPerKg.toFixed(2)} ₽/кг</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class}">
                        ${status.text}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onclick="viewProductionTask('${task.id}')" 
                            class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="exportProductionTask('${task.id}')" 
                            class="text-green-600 hover:text-green-900">
                        <i class="fas fa-file-export"></i>
                    </button>
                    <button onclick="printProductionTaskOnly('${task.id}')" 
                            class="text-purple-600 hover:text-purple-900">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function getProductionStatus(task) {
    switch (task.status) {
        case 'draft':
            return { class: 'status-draft', text: 'Черновик' };
        case 'active':
            return { class: 'status-active', text: 'Активное' };
        case 'in-production':
            return { class: 'status-in-production', text: 'В производстве' };
        case 'completed':
            return { class: 'status-completed', text: 'Завершено' };
        case 'cancelled':
            return { class: 'status-cancelled', text: 'Отменено' };
        default:
            return { class: 'status-draft', text: 'Неизвестно' };
    }
}

// ЭКСПОРТ И ПЕЧАТЬ
function showExportModal(task) {
    const modal = document.getElementById('export-print-modal');
    const info = document.getElementById('export-task-info');
    
    info.innerHTML = `
        <div><strong>Партия:</strong> ${task.batchNumber}</div>
        <div><strong>Рецепт:</strong> ${task.recipeName}</div>
        <div><strong>Объем:</strong> ${task.batchSize} кг</div>
        <div><strong>Дата:</strong> ${new Date(task.productionDate).toLocaleDateString('ru-RU')}</div>
        <div><strong>Себестоимость:</strong> ${task.totalCost.toFixed(2)} ₽</div>
    `;

    // Сохранить ID задания для экспорта
    modal.dataset.taskId = task.id;
    
    showModal('export-print-modal');
}

function exportToExcel() {
    const taskId = document.getElementById('export-print-modal').dataset.taskId;
    const task = productionTasks.find(t => t.id === taskId);
    const recipe = recipes.find(r => r.id === task.recipeId);

    if (!task || !recipe) return;

    // Создание данных для Excel
    const workbook = XLSX.utils.book_new();
    
    // Лист с производственным заданием
    const taskData = [
        ['Производственное задание "Повар Бим"'],
        [''],
        ['Номер партии:', task.batchNumber],
        ['Рецепт:', task.recipeName],
        ['Категория:', recipe.category],
        ['Объем партии:', task.batchSize + ' кг'],
        ['Дата производства:', new Date(task.productionDate).toLocaleDateString('ru-RU')],
        [''],
        ['Состав рецепта на ' + task.batchSize + ' кг:'],
        ['Ингредиент', 'Вес (кг)', 'Цена за кг (₽)', 'Стоимость (₽)']
    ];

    let totalIngredientCost = 0;
    recipe.ingredients.forEach(ing => {
        const ingredient = ingredients.find(i => i.id === ing.ingredientId);
        const neededWeight = (ing.weight * task.batchSize) / 1000;
        const cost = neededWeight * ingredient.price;
        totalIngredientCost += cost;
        
        taskData.push([
            ing.name,
            neededWeight.toFixed(3),
            ingredient.price.toFixed(2),
            cost.toFixed(2)
        ]);
    });

    taskData.push(['']);
    taskData.push(['Итого себестоимость:', '', '', totalIngredientCost.toFixed(2) + ' ₽']);
    taskData.push(['Себестоимость за 1 кг:', '', '', (totalIngredientCost / task.batchSize).toFixed(2) + ' ₽']);

    const worksheet = XLSX.utils.aoa_to_sheet(taskData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Производственное задание');

    // Сохранение файла
    const filename = `Задание_${task.batchNumber}_${task.recipeName}.xlsx`;
    XLSX.writeFile(workbook, filename);

    showNotification('Excel файл сохранен', 'success');
}

function printProductionTask() {
    const taskId = document.getElementById('export-print-modal').dataset.taskId;
    const task = productionTasks.find(t => t.id === taskId);
    const recipe = recipes.find(r => r.id === task.recipeId);

    if (!task || !recipe) return;

    // Создание HTML для печати
    let printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Производственное задание "Повар Бим"</h1>
            <hr>
            <p><strong>Номер партии:</strong> ${task.batchNumber}</p>
            <p><strong>Рецепт:</strong> ${task.recipeName} (${recipe.category})</p>
            <p><strong>Объем партии:</strong> ${task.batchSize} кг</p>
            <p><strong>Дата производства:</strong> ${new Date(task.productionDate).toLocaleDateString('ru-RU')}</p>
            <br>
            <h3>Состав рецепта на ${task.batchSize} кг:</h3>
            <table border="1" style="width:100%; border-collapse: collapse;">
                <tr>
                    <th>Ингредиент</th>
                    <th>Вес (кг)</th>
                    <th>Цена за кг (₽)</th>
                    <th>Стоимость (₽)</th>
                </tr>
    `;

    let totalCost = 0;
    recipe.ingredients.forEach(ing => {
        const ingredient = ingredients.find(i => i.id === ing.ingredientId);
        const neededWeight = (ing.weight * task.batchSize) / 1000;
        const cost = neededWeight * ingredient.price;
        totalCost += cost;

        printContent += `
            <tr>
                <td>${ing.name}</td>
                <td>${neededWeight.toFixed(3)}</td>
                <td>${ingredient.price.toFixed(2)}</td>
                <td>${cost.toFixed(2)}</td>
            </tr>
        `;
    });

    printContent += `
            </table>
            <br>
            <p><strong>Итого себестоимость:</strong> ${totalCost.toFixed(2)} ₽</p>
            <p><strong>Себестоимость за 1 кг:</strong> ${(totalCost / task.batchSize).toFixed(2)} ₽</p>
            <hr>
            <p>Дата печати: ${new Date().toLocaleString('ru-RU')}</p>
        </div>
    `;

    // Открыть новое окно для печати
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Производственное задание ${task.batchNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Функция для печати только одного задания (вызывается из таблицы)
function printProductionTaskOnly(taskId) {
    const modal = document.getElementById('export-print-modal');
    modal.dataset.taskId = taskId;
    printProductionTask();
}

// УПРАВЛЕНИЕ ДАННЫМИ
function saveDataToStorage() {
    localStorage.setItem('povoarBimIngredients', JSON.stringify(ingredients));
    localStorage.setItem('povoarBimRecipes', JSON.stringify(recipes));
    localStorage.setItem('povoarBimProductionTasks', JSON.stringify(productionTasks));
    localStorage.setItem('povoarBimPackagingMaterials', JSON.stringify(packagingMaterials));
}

function loadDataFromStorage() {
    const storedIngredients = localStorage.getItem('povoarBimIngredients');
    const storedRecipes = localStorage.getItem('povoarBimRecipes');
    const storedTasks = localStorage.getItem('povoarBimProductionTasks');
    const storedPackaging = localStorage.getItem('povoarBimPackagingMaterials');

    if (storedIngredients) ingredients = JSON.parse(storedIngredients);
    if (storedRecipes) recipes = JSON.parse(storedRecipes);
    if (storedTasks) productionTasks = JSON.parse(storedTasks);
    if (storedPackaging) packagingMaterials = JSON.parse(storedPackaging);
}

function loadSampleData() {
    // Загрузить данные из localStorage
    loadDataFromStorage();

    // Если нет данных, создать примеры
    if (ingredients.length === 0) {
        ingredients = [
            {
                id: '1',
                name: 'Говядина (фарш)',
                category: 'мясо',
                stock: 25.5,
                price: 450,
                minStock: 5,
                supplier: 'Мясокомбинат "Премиум"',
                description: 'Свежий говяжий фарш высшего сорта',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Куриная грудка (рубленая)',
                category: 'мясо',
                stock: 18.2,
                price: 320,
                minStock: 3,
                supplier: 'Птицефабрика "Здоровье"',
                description: 'Диетическое куриное мясо без кожи',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Филе лосося',
                category: 'рыба',
                stock: 12.8,
                price: 850,
                minStock: 2,
                supplier: 'Рыбный дом "Океан"',
                description: 'Свежее филе атлантического лосося',
                createdAt: new Date().toISOString()
            },
            {
                id: '4',
                name: 'Рис бурый',
                category: 'крупы',
                stock: 45.0,
                price: 80,
                minStock: 10,
                supplier: 'ООО "Здоровые злаки"',
                description: 'Цельнозерновой бурый рис, богатый клетчаткой',
                createdAt: new Date().toISOString()
            },
            {
                id: '5',
                name: 'Морковь сушеная',
                category: 'овощи',
                stock: 8.5,
                price: 120,
                minStock: 2,
                supplier: 'Эко-Продукт',
                description: 'Натуральная сушеная морковь без добавок',
                createdAt: new Date().toISOString()
            },
            {
                id: '6',
                name: 'Витаминно-минеральный комплекс',
                category: 'витамины',
                stock: 3.2,
                price: 1200,
                minStock: 0.5,
                supplier: 'ВетФарм',
                description: 'Сбалансированный комплекс витаминов и минералов для собак',
                createdAt: new Date().toISOString()
            }
        ];
        saveDataToStorage();
    }
}

// ОБНОВЛЕНИЕ СТАТИСТИКИ ДАШБОРДА
function updateDashboardStats() {
    document.getElementById('total-customers').textContent = '0'; // Заглушка для клиентов
    document.getElementById('total-recipes').textContent = recipes.length;
    document.getElementById('active-production').textContent = productionTasks.filter(task => 
        task.status === 'in-production' || task.status === 'active'
    ).length;
    document.getElementById('total-ingredients').textContent = ingredients.length;
}

// УПАКОВОЧНЫЕ МАТЕРИАЛЫ
function savePackaging(event) {
    event.preventDefault();
    // Логика сохранения упаковочных материалов
    showNotification('Упаковочный материал сохранен', 'success');
    hideModal('packaging-modal');
}

function loadPackagingMaterials() {
    // Логика загрузки упаковочных материалов
}

// УВЕДОМЛЕНИЯ
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    notification.className += ` ${bgColor} text-white`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Показать уведомление
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Скрыть уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ФИЛЬТРЫ
function filterIngredients() {
    // Логика фильтрации ингредиентов
}

function clearIngredientFilters() {
    document.getElementById('ingredient-search').value = '';
    document.getElementById('ingredient-category-filter').value = '';
    document.getElementById('ingredient-availability-filter').value = '';
    loadIngredients();
}

function clearProductionFilters() {
    document.getElementById('production-search').value = '';
    document.getElementById('production-status-filter').value = '';
    document.getElementById('production-recipe-filter').value = '';
    document.getElementById('production-date-filter').value = '';
    loadProductionTasks();
}

// Заглушки для недостающих функций
function viewRecipe(id) { showNotification('Просмотр рецепта', 'info'); }
function editRecipe(id) { showNotification('Редактирование рецепта', 'info'); }
function deleteRecipe(id) { 
    if (confirm('Удалить рецепт?')) {
        recipes = recipes.filter(r => r.id !== id);
        saveDataToStorage();
        loadRecipes();
        showNotification('Рецепт удален', 'success');
    }
}
function viewProductionTask(id) { showNotification('Просмотр производственного задания', 'info'); }
function exportProductionTask(id) { 
    const modal = document.getElementById('export-print-modal');
    modal.dataset.taskId = id;
    const task = productionTasks.find(t => t.id === id);
    showExportModal(task); 
}