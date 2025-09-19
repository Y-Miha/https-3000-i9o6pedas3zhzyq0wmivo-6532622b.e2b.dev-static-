// CRM "Повар Бим" - Система управления рецептами
// Основные данные
let customers = [];
let products = [];
let orders = [];
let ingredients = [];
let recipes = [];
let productionTasks = [];
let categories = ['Сухие каши', 'Влажные корма', 'Лакомства', 'Добавки'];
let units = ['Килограммы (кг)', 'Граммы (г)', 'Штуки (шт)', 'Литры (л)', 'Пачки (пач)'];

// Счетчики для ID
let customerIdCounter = 1;
let productIdCounter = 1;
let orderIdCounter = 1;
let ingredientIdCounter = 1;
let recipeIdCounter = 1;
let productionIdCounter = 1;

// Текущие данные для форм
let currentOrderProducts = [];
let currentRecipeIngredients = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeData();
    showSection('dashboard');
    updateStats();
    updateAllDropdowns();
});

// Загрузка данных из localStorage
function loadFromStorage() {
    const savedCustomers = localStorage.getItem('crm_customers');
    if (savedCustomers) customers = JSON.parse(savedCustomers);
    
    const savedProducts = localStorage.getItem('crm_products');
    if (savedProducts) products = JSON.parse(savedProducts);
    
    const savedOrders = localStorage.getItem('crm_orders');
    if (savedOrders) orders = JSON.parse(savedOrders);
    
    const savedIngredients = localStorage.getItem('crm_ingredients');
    if (savedIngredients) ingredients = JSON.parse(savedIngredients);
    
    const savedRecipes = localStorage.getItem('crm_recipes');
    if (savedRecipes) recipes = JSON.parse(savedRecipes);
    
    const savedProduction = localStorage.getItem('crm_production');
    if (savedProduction) productionTasks = JSON.parse(savedProduction);
    
    const savedCategories = localStorage.getItem('crm_categories');
    if (savedCategories) categories = JSON.parse(savedCategories);
    
    const savedUnits = localStorage.getItem('crm_units');
    if (savedUnits) units = JSON.parse(savedUnits);
    
    // Обновляем счетчики
    if (customers.length > 0) customerIdCounter = Math.max(...customers.map(c => c.id)) + 1;
    if (products.length > 0) productIdCounter = Math.max(...products.map(p => p.id)) + 1;
    if (orders.length > 0) orderIdCounter = Math.max(...orders.map(o => o.id)) + 1;
    if (ingredients.length > 0) ingredientIdCounter = Math.max(...ingredients.map(i => i.id)) + 1;
    if (recipes.length > 0) recipeIdCounter = Math.max(...recipes.map(r => r.id)) + 1;
    if (productionTasks.length > 0) productionIdCounter = Math.max(...productionTasks.map(p => p.id)) + 1;
}

// Сохранение данных в localStorage
function saveToStorage() {
    localStorage.setItem('crm_customers', JSON.stringify(customers));
    localStorage.setItem('crm_products', JSON.stringify(products));
    localStorage.setItem('crm_orders', JSON.stringify(orders));
    localStorage.setItem('crm_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('crm_recipes', JSON.stringify(recipes));
    localStorage.setItem('crm_production', JSON.stringify(productionTasks));
    localStorage.setItem('crm_categories', JSON.stringify(categories));
    localStorage.setItem('crm_units', JSON.stringify(units));
}

// Инициализация тестовых данных
function initializeData() {
    if (ingredients.length === 0) {
        ingredients = [
            { id: 1, name: 'Говядина премиум', category: 'meat', price: 450.00, stock: 50.0, minStock: 10.0, supplier: 'МясКом' },
            { id: 2, name: 'Рис басмати', category: 'cereals', price: 120.00, stock: 25.0, minStock: 5.0, supplier: 'АгроТрейд' },
            { id: 3, name: 'Морковь', category: 'vegetables', price: 35.00, stock: 15.0, minStock: 3.0, supplier: 'ОвощБаза' },
            { id: 4, name: 'Витаминная добавка', category: 'supplements', price: 850.00, stock: 5.0, minStock: 1.0, supplier: 'ВитаПлюс' }
        ];
        ingredientIdCounter = 5;
    }
    
    if (customers.length === 0) {
        customers = [
            { id: 1, name: 'Анна Петрова', type: 'physical', email: 'anna@example.com', phone: '+7 (900) 123-45-67', address: 'г. Москва, ул. Примерная, 123', status: 'active' },
            { id: 2, name: 'ООО "ЗооМир"', type: 'store', email: 'info@zoomir.ru', phone: '+7 (495) 123-45-67', address: 'г. Москва, пр-т Торговый, 45', status: 'active' }
        ];
        customerIdCounter = 3;
    }
    
    if (products.length === 0) {
        products = [
            { id: 1, name: 'Каша "Говядина" 1кг', category: 'Сухие каши', unit: 'Килограммы (кг)', price: 280.00, description: 'Полнорационная каша с говядиной' },
            { id: 2, name: 'Каша "Лайт" 500г', category: 'Сухие каши', unit: 'Граммы (г)', price: 150.00, description: 'Диетическая каша для собак' }
        ];
        productIdCounter = 3;
    }
    
    saveToStorage();
    updateStats();
}

// Переключение между разделами
function showSection(sectionName) {
    // Скрыть все разделы
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Показать выбранный раздел
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Обновить активную ссылку в навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-gray-200');
    });
    
    // Рендерить данные для активного раздела
    switch(sectionName) {
        case 'customers':
            renderCustomers();
            break;
        case 'products':
            renderProducts();
            break;
        case 'orders':
            renderOrders();
            break;
        case 'ingredients':
            renderIngredients();
            break;
        case 'recipes':
            renderRecipes();
            break;
        case 'production':
            renderProduction();
            break;
        case 'dashboard':
            updateStats();
            break;
    }
}

// Обновление статистики на панели управления
function updateStats() {
    document.getElementById('stats-customers').textContent = customers.length;
    document.getElementById('stats-products').textContent = products.length;
    document.getElementById('stats-ingredients').textContent = ingredients.length;
    document.getElementById('stats-recipes').textContent = recipes.length;
}

// ============= УПРАВЛЕНИЕ МОДАЛАМИ =============
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Обновляем выпадающие списки при открытии модалов
        if (modalId === 'orderModal') {
            loadCustomersForOrder();
            loadProductsForOrder();
        } else if (modalId === 'recipeModal') {
            loadIngredientsForRecipe();
        } else if (modalId === 'productionModal') {
            loadRecipesForProduction();
        } else if (modalId === 'productModal') {
            updateCategoryDropdown();
            updateUnitDropdown();
        } else if (modalId === 'categoryModal') {
            renderCategoryList();
        } else if (modalId === 'unitModal') {
            renderUnitList();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Очистка форм при закрытии
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // Очистка временных данных
        if (modalId === 'orderModal') {
            currentOrderProducts = [];
            document.getElementById('orderProductsList').innerHTML = '';
            document.getElementById('orderTotal').textContent = '0.00 ₽';
        } else if (modalId === 'recipeModal') {
            currentRecipeIngredients = [];
            document.getElementById('recipeIngredientsList').innerHTML = '';
            updateRecipeCalculations();
        } else if (modalId === 'productionModal') {
            document.getElementById('productionPreview').style.display = 'none';
        }
    }
}

// ============= КЛИЕНТЫ =============
function renderCustomers() {
    const tbody = document.getElementById('customers-table');
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const typeLabels = {
            physical: 'Физ. лицо',
            legal: 'Юр. лицо',
            store: 'Зоомагазин',
            wholesale: 'Оптовик'
        };
        
        const typeBadgeClass = `badge-${customer.type}`;
        const statusBadgeClass = customer.status === 'active' ? 'badge-active' : 'badge-inactive';
        const statusText = customer.status === 'active' ? 'Активен' : 'Неактивен';
        
        const row = `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                    <div class="text-sm text-gray-500">${customer.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeBadgeClass}">
                        ${typeLabels[customer.type]}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${customer.phone}</div>
                    <div class="text-sm text-gray-500">${customer.address}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editCustomer(${customer.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCustomer(${customer.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function saveCustomer() {
    const name = document.getElementById('customerName').value;
    const type = document.getElementById('customerType').value;
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    
    if (!name) {
        alert('Введите название/имя клиента');
        return;
    }
    
    const customer = {
        id: customerIdCounter++,
        name,
        type,
        email,
        phone,
        address,
        status: 'active'
    };
    
    customers.push(customer);
    saveToStorage();
    closeModal('customerModal');
    renderCustomers();
    updateStats();
    updateAllDropdowns();
}

function deleteCustomer(id) {
    if (confirm('Удалить этого клиента?')) {
        customers = customers.filter(c => c.id !== id);
        saveToStorage();
        renderCustomers();
        updateStats();
        updateAllDropdowns();
    }
}

// ============= ТОВАРЫ =============
function renderProducts() {
    const tbody = document.getElementById('products-table');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${product.name}</div>
                    <div class="text-sm text-gray-500">${product.description}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.category}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.unit}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price.toFixed(2)} ₽
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editProduct(${product.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function saveProduct() {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const unit = document.getElementById('productUnit').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    
    if (!name || !category || !unit || !price) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    const product = {
        id: productIdCounter++,
        name,
        category,
        unit,
        price,
        description
    };
    
    products.push(product);
    saveToStorage();
    closeModal('productModal');
    renderProducts();
    updateStats();
    updateAllDropdowns();
}

function deleteProduct(id) {
    if (confirm('Удалить этот товар?')) {
        products = products.filter(p => p.id !== id);
        saveToStorage();
        renderProducts();
        updateStats();
        updateAllDropdowns();
    }
}

// ============= КАТЕГОРИИ И ЕДИНИЦЫ ИЗМЕРЕНИЯ =============
function updateCategoryDropdown() {
    const select = document.getElementById('productCategory');
    select.innerHTML = '';
    categories.forEach(category => {
        select.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

function updateUnitDropdown() {
    const select = document.getElementById('productUnit');
    select.innerHTML = '';
    units.forEach(unit => {
        select.innerHTML += `<option value="${unit}">${unit}</option>`;
    });
}

function renderCategoryList() {
    const container = document.getElementById('categoryList');
    container.innerHTML = '';
    categories.forEach((category, index) => {
        container.innerHTML += `
            <div class="flex justify-between items-center p-2 border rounded">
                <span>${category}</span>
                <button onclick="removeCategory(${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

function renderUnitList() {
    const container = document.getElementById('unitList');
    container.innerHTML = '';
    units.forEach((unit, index) => {
        container.innerHTML += `
            <div class="flex justify-between items-center p-2 border rounded">
                <span>${unit}</span>
                <button onclick="removeUnit(${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

function addCategory() {
    const input = document.getElementById('newCategory');
    const category = input.value.trim();
    if (category && !categories.includes(category)) {
        categories.push(category);
        input.value = '';
        saveToStorage();
        renderCategoryList();
        updateCategoryDropdown();
    }
}

function removeCategory(index) {
    categories.splice(index, 1);
    saveToStorage();
    renderCategoryList();
    updateCategoryDropdown();
}

function addUnit() {
    const input = document.getElementById('newUnit');
    const unit = input.value.trim();
    if (unit && !units.includes(unit)) {
        units.push(unit);
        input.value = '';
        saveToStorage();
        renderUnitList();
        updateUnitDropdown();
    }
}

function removeUnit(index) {
    units.splice(index, 1);
    saveToStorage();
    renderUnitList();
    updateUnitDropdown();
}

// ============= ЗАКАЗЫ =============
function renderOrders() {
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const customer = customers.find(c => c.id === order.customerId);
        const customerName = customer ? customer.name : 'Неизвестно';
        
        const statusLabels = {
            new: 'Новый',
            'in-progress': 'В работе',
            completed: 'Выполнен',
            cancelled: 'Отменён'
        };
        
        const statusClass = `status-${order.status}`;
        
        const row = `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #${order.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${customerName}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(order.date).toLocaleDateString('ru-RU')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total.toFixed(2)} ₽
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusLabels[order.status]}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="changeOrderStatus(${order.id})" class="text-green-600 hover:text-green-900 mr-3" title="Изменить статус">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button onclick="viewOrder(${order.id})" class="text-blue-600 hover:text-blue-900 mr-3" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteOrder(${order.id})" class="text-red-600 hover:text-red-900" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function loadCustomersForOrder() {
    const select = document.getElementById('orderCustomer');
    select.innerHTML = '<option value="">Выберите клиента</option>';
    customers.forEach(customer => {
        select.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
    });
}

function loadProductsForOrder() {
    const select = document.getElementById('orderProductSelect');
    select.innerHTML = '<option value="">Выберите товар</option>';
    products.forEach(product => {
        select.innerHTML += `<option value="${product.id}">${product.name} - ${product.price.toFixed(2)} ₽</option>`;
    });
}

function addProductToOrder() {
    const productId = parseInt(document.getElementById('orderProductSelect').value);
    const quantity = parseFloat(document.getElementById('orderProductQuantity').value);
    
    if (!productId || !quantity) {
        alert('Выберите товар и укажите количество');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Товар не найден');
        return;
    }
    
    // Проверяем, есть ли уже этот товар в заказе
    const existingIndex = currentOrderProducts.findIndex(p => p.productId === productId);
    if (existingIndex >= 0) {
        currentOrderProducts[existingIndex].quantity += quantity;
    } else {
        currentOrderProducts.push({
            productId,
            name: product.name,
            price: product.price,
            quantity,
            total: product.price * quantity
        });
    }
    
    updateOrderProductsList();
    document.getElementById('orderProductSelect').value = '';
    document.getElementById('orderProductQuantity').value = '';
}

function updateOrderProductsList() {
    const container = document.getElementById('orderProductsList');
    container.innerHTML = '';
    
    let total = 0;
    currentOrderProducts.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        container.innerHTML += `
            <div class="flex justify-between items-center p-2 border rounded">
                <div>
                    <span class="font-medium">${item.name}</span>
                    <span class="text-gray-500">x ${item.quantity}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span>${itemTotal.toFixed(2)} ₽</span>
                    <button onclick="removeProductFromOrder(${index})" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    document.getElementById('orderTotal').textContent = `${total.toFixed(2)} ₽`;
}

function removeProductFromOrder(index) {
    currentOrderProducts.splice(index, 1);
    updateOrderProductsList();
}

function saveOrder() {
    const customerId = parseInt(document.getElementById('orderCustomer').value);
    const deliveryDate = document.getElementById('orderDeliveryDate').value;
    const comment = document.getElementById('orderComment').value;
    
    if (!customerId) {
        alert('Выберите клиента');
        return;
    }
    
    if (currentOrderProducts.length === 0) {
        alert('Добавьте товары в заказ');
        return;
    }
    
    const total = currentOrderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = {
        id: orderIdCounter++,
        customerId,
        date: new Date().toISOString(),
        deliveryDate,
        products: [...currentOrderProducts],
        total,
        status: 'new',
        comment
    };
    
    orders.push(order);
    saveToStorage();
    closeModal('orderModal');
    renderOrders();
    updateStats();
}

function changeOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const statuses = [
        { value: 'new', label: 'Новый' },
        { value: 'in-progress', label: 'В работе' },
        { value: 'completed', label: 'Выполнен' },
        { value: 'cancelled', label: 'Отменён' }
    ];
    
    const currentIndex = statuses.findIndex(s => s.value === order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    
    order.status = statuses[nextIndex].value;
    saveToStorage();
    renderOrders();
}

function deleteOrder(id) {
    if (confirm('Удалить этот заказ?')) {
        orders = orders.filter(o => o.id !== id);
        saveToStorage();
        renderOrders();
        updateStats();
    }
}

// ============= ИНГРЕДИЕНТЫ =============
function renderIngredients() {
    const tbody = document.getElementById('ingredients-table');
    tbody.innerHTML = '';
    
    ingredients.forEach(ingredient => {
        const categoryLabels = {
            meat: 'Мясо',
            cereals: 'Крупы',
            vegetables: 'Овощи',
            supplements: 'Добавки',
            vitamins: 'Витамины'
        };
        
        const availabilityClass = ingredient.stock > 0 ? 'text-green-600' : 'text-red-600';
        const availabilityIcon = ingredient.stock > 0 ? 'fas fa-check-circle' : 'fas fa-times-circle';
        const statusText = ingredient.stock > 0 ? 'На складе' : 'Нет на складе';
        
        const lowStock = ingredient.stock <= (ingredient.minStock || 0);
        const stockClass = lowStock ? 'text-orange-600 font-bold' : 'text-gray-900';
        
        const row = `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${ingredient.name}</div>
                    <div class="text-sm text-gray-500">Поставщик: ${ingredient.supplier}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${categoryLabels[ingredient.category]}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${ingredient.price.toFixed(2)} ₽
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${stockClass}">
                    ${ingredient.stock.toFixed(1)} кг
                    ${lowStock ? '<br><small class="text-orange-600">⚠ Мало на складе</small>' : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center ${availabilityClass}">
                        <i class="${availabilityIcon} mr-1"></i>
                        <span class="text-sm">${statusText}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editIngredient(${ingredient.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteIngredient(${ingredient.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function saveIngredient() {
    const name = document.getElementById('ingredientName').value;
    const category = document.getElementById('ingredientCategory').value;
    const price = parseFloat(document.getElementById('ingredientPrice').value);
    const stock = parseFloat(document.getElementById('ingredientStock').value);
    const minStock = parseFloat(document.getElementById('ingredientMinStock').value) || 0;
    const supplier = document.getElementById('ingredientSupplier').value;
    
    if (!name || !price || stock < 0) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    const ingredient = {
        id: ingredientIdCounter++,
        name,
        category,
        price,
        stock,
        minStock,
        supplier
    };
    
    ingredients.push(ingredient);
    saveToStorage();
    closeModal('ingredientModal');
    renderIngredients();
    updateStats();
    updateAllDropdowns();
}

function deleteIngredient(id) {
    if (confirm('Удалить этот ингредиент?')) {
        ingredients = ingredients.filter(i => i.id !== id);
        saveToStorage();
        renderIngredients();
        updateStats();
        updateAllDropdowns();
    }
}

// ============= РЕЦЕПТЫ =============
function renderRecipes() {
    const tbody = document.getElementById('recipes-table');
    tbody.innerHTML = '';
    
    recipes.forEach(recipe => {
        const typeLabels = {
            beef: 'Говядина',
            chicken: 'Курица',
            salmon: 'Лосось',
            light: 'Лайт'
        };
        
        // Проверяем доступность ингредиентов
        let canProduce = Infinity;
        let availableIngredients = true;
        
        recipe.ingredients.forEach(recipeIng => {
            const ingredient = ingredients.find(i => i.id === recipeIng.ingredientId);
            if (ingredient) {
                const possibleKg = ingredient.stock / (recipeIng.amount / 1000);
                canProduce = Math.min(canProduce, possibleKg);
            } else {
                availableIngredients = false;
            }
        });
        
        if (!availableIngredients) canProduce = 0;
        const canProduceText = canProduce === Infinity ? '∞' : `${Math.floor(canProduce)} кг`;
        const canProduceClass = canProduce > 0 ? 'text-green-600' : 'text-red-600';
        
        const row = `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${recipe.name}</div>
                    <div class="text-sm text-gray-500">${recipe.ingredients.length} ингредиентов</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${typeLabels[recipe.type]}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${recipe.ingredients.length}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${recipe.costPerKg.toFixed(2)} ₽
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${canProduceClass} font-semibold">
                    ${canProduceText}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewRecipe(${recipe.id})" class="text-blue-600 hover:text-blue-900 mr-3" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editRecipe(${recipe.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteRecipe(${recipe.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function loadIngredientsForRecipe() {
    const select = document.getElementById('recipeIngredientSelect');
    select.innerHTML = '<option value="">Выберите ингредиент</option>';
    ingredients.forEach(ingredient => {
        select.innerHTML += `<option value="${ingredient.id}">${ingredient.name} - ${ingredient.price.toFixed(2)} ₽/кг</option>`;
    });
}

function addIngredientToRecipe() {
    const ingredientId = parseInt(document.getElementById('recipeIngredientSelect').value);
    const amount = parseFloat(document.getElementById('recipeIngredientAmount').value);
    
    if (!ingredientId || !amount) {
        alert('Выберите ингредиент и укажите количество');
        return;
    }
    
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) {
        alert('Ингредиент не найден');
        return;
    }
    
    // Проверяем, есть ли уже этот ингредиент в рецепте
    const existingIndex = currentRecipeIngredients.findIndex(i => i.ingredientId === ingredientId);
    if (existingIndex >= 0) {
        currentRecipeIngredients[existingIndex].amount += amount;
    } else {
        currentRecipeIngredients.push({
            ingredientId,
            name: ingredient.name,
            amount,
            price: ingredient.price,
            cost: (amount / 1000) * ingredient.price
        });
    }
    
    updateRecipeIngredientsList();
    document.getElementById('recipeIngredientSelect').value = '';
    document.getElementById('recipeIngredientAmount').value = '';
}

function updateRecipeIngredientsList() {
    const container = document.getElementById('recipeIngredientsList');
    container.innerHTML = '';
    
    currentRecipeIngredients.forEach((item, index) => {
        const cost = (item.amount / 1000) * item.price;
        
        container.innerHTML += `
            <div class="flex justify-between items-center p-2 border rounded">
                <div>
                    <span class="font-medium">${item.name}</span>
                    <span class="text-gray-500">${item.amount} г</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span>${cost.toFixed(2)} ₽</span>
                    <button onclick="removeIngredientFromRecipe(${index})" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    updateRecipeCalculations();
}

function updateRecipeCalculations() {
    const totalWeight = currentRecipeIngredients.reduce((sum, item) => sum + item.amount, 0);
    const totalCost = currentRecipeIngredients.reduce((sum, item) => sum + ((item.amount / 1000) * item.price), 0);
    const costPerKg = totalWeight > 0 ? (totalCost / totalWeight) * 1000 : 0;
    
    document.getElementById('recipeTotalWeight').textContent = `${totalWeight} г`;
    document.getElementById('recipeTotalCost').textContent = `${totalCost.toFixed(2)} ₽`;
    document.getElementById('recipeCostPerKg').textContent = `${costPerKg.toFixed(2)} ₽`;
}

function removeIngredientFromRecipe(index) {
    currentRecipeIngredients.splice(index, 1);
    updateRecipeIngredientsList();
}

function saveRecipe() {
    const name = document.getElementById('recipeName').value;
    const type = document.getElementById('recipeType').value;
    const instructions = document.getElementById('recipeInstructions').value;
    
    if (!name) {
        alert('Введите название рецепта');
        return;
    }
    
    if (currentRecipeIngredients.length === 0) {
        alert('Добавьте ингредиенты в рецепт');
        return;
    }
    
    const totalWeight = currentRecipeIngredients.reduce((sum, item) => sum + item.amount, 0);
    const totalCost = currentRecipeIngredients.reduce((sum, item) => sum + ((item.amount / 1000) * item.price), 0);
    const costPerKg = (totalCost / totalWeight) * 1000;
    
    const recipe = {
        id: recipeIdCounter++,
        name,
        type,
        ingredients: [...currentRecipeIngredients],
        totalWeight,
        totalCost,
        costPerKg,
        instructions,
        createdAt: new Date().toISOString()
    };
    
    recipes.push(recipe);
    saveToStorage();
    closeModal('recipeModal');
    renderRecipes();
    updateStats();
    updateAllDropdowns();
}

function deleteRecipe(id) {
    if (confirm('Удалить этот рецепт?')) {
        recipes = recipes.filter(r => r.id !== id);
        saveToStorage();
        renderRecipes();
        updateStats();
        updateAllDropdowns();
    }
}

// ============= ПРОИЗВОДСТВО =============
function renderProduction() {
    const tbody = document.getElementById('production-table');
    tbody.innerHTML = '';
    
    productionTasks.forEach(task => {
        const recipe = recipes.find(r => r.id === task.recipeId);
        const recipeName = recipe ? recipe.name : 'Неизвестно';
        
        const statusLabels = {
            pending: 'Ожидает',
            'in-progress': 'В производстве',
            completed: 'Завершено',
            cancelled: 'Отменено'
        };
        
        const statusClass = `status-${task.status}`;
        
        const row = `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${task.batchNumber}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${recipeName}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${task.quantity} кг
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(task.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${task.totalCost.toFixed(2)} ₽
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusLabels[task.status]}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="changeProductionStatus(${task.id})" class="text-green-600 hover:text-green-900 mr-3" title="Изменить статус">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button onclick="viewProductionTask(${task.id})" class="text-blue-600 hover:text-blue-900 mr-3" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteProductionTask(${task.id})" class="text-red-600 hover:text-red-900" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function loadRecipesForProduction() {
    const select = document.getElementById('productionRecipe');
    select.innerHTML = '<option value="">Выберите рецепт</option>';
    recipes.forEach(recipe => {
        select.innerHTML += `<option value="${recipe.id}">${recipe.name} (${recipe.costPerKg.toFixed(2)} ₽/кг)</option>`;
    });
}

function updateProductionPreview() {
    const recipeId = parseInt(document.getElementById('productionRecipe').value);
    const quantity = parseFloat(document.getElementById('productionQuantity').value);
    
    const preview = document.getElementById('productionPreview');
    
    if (!recipeId || !quantity) {
        preview.style.display = 'none';
        return;
    }
    
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
        preview.style.display = 'none';
        return;
    }
    
    preview.style.display = 'block';
    
    // Рассчитываем необходимые ингредиенты
    const container = document.getElementById('productionIngredientsList');
    container.innerHTML = '';
    
    let allAvailable = true;
    let totalCost = 0;
    
    recipe.ingredients.forEach(recipeIng => {
        const ingredient = ingredients.find(i => i.id === recipeIng.ingredientId);
        if (ingredient) {
            const neededAmount = (recipeIng.amount / 1000) * quantity; // в кг
            const cost = neededAmount * ingredient.price;
            totalCost += cost;
            
            const available = ingredient.stock >= neededAmount;
            if (!available) allAvailable = false;
            
            const statusIcon = available ? 
                '<i class="fas fa-check text-green-600"></i>' : 
                '<i class="fas fa-times text-red-600"></i>';
            
            container.innerHTML += `
                <div class="flex justify-between items-center text-sm">
                    <span>${ingredient.name}: ${neededAmount.toFixed(2)} кг</span>
                    <div class="flex items-center space-x-2">
                        <span>${cost.toFixed(2)} ₽</span>
                        ${statusIcon}
                    </div>
                </div>
            `;
        }
    });
    
    document.getElementById('productionTotalCost').textContent = `${totalCost.toFixed(2)} ₽`;
    
    // Проверка доступности
    const availabilityCheck = document.getElementById('productionAvailabilityCheck');
    if (allAvailable) {
        availabilityCheck.innerHTML = '<div class="text-green-600 text-sm"><i class="fas fa-check-circle mr-1"></i> Все ингредиенты доступны</div>';
    } else {
        availabilityCheck.innerHTML = '<div class="text-red-600 text-sm"><i class="fas fa-exclamation-triangle mr-1"></i> Недостаточно ингредиентов на складе</div>';
    }
}

function generateBatchNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const counter = (productionTasks.length + 1).toString().padStart(3, '0');
    return `PB${year}${month}${day}-${counter}`;
}

function saveProduction() {
    const recipeId = parseInt(document.getElementById('productionRecipe').value);
    const quantity = parseFloat(document.getElementById('productionQuantity').value);
    const productionDate = document.getElementById('productionDate').value;
    const comment = document.getElementById('productionComment').value;
    
    if (!recipeId || !quantity) {
        alert('Выберите рецепт и укажите количество');
        return;
    }
    
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
        alert('Рецепт не найден');
        return;
    }
    
    // Проверяем доступность ингредиентов
    let allAvailable = true;
    let totalCost = 0;
    const requiredIngredients = [];
    
    recipe.ingredients.forEach(recipeIng => {
        const ingredient = ingredients.find(i => i.id === recipeIng.ingredientId);
        if (ingredient) {
            const neededAmount = (recipeIng.amount / 1000) * quantity;
            const cost = neededAmount * ingredient.price;
            totalCost += cost;
            
            requiredIngredients.push({
                ingredientId: ingredient.id,
                name: ingredient.name,
                amount: neededAmount,
                cost
            });
            
            if (ingredient.stock < neededAmount) {
                allAvailable = false;
            }
        }
    });
    
    if (!allAvailable) {
        if (!confirm('Недостаточно ингредиентов на складе. Создать задачу всё равно?')) {
            return;
        }
    }
    
    const task = {
        id: productionIdCounter++,
        batchNumber: generateBatchNumber(),
        recipeId,
        quantity,
        totalCost,
        requiredIngredients,
        productionDate,
        createdAt: new Date().toISOString(),
        status: 'pending',
        comment
    };
    
    productionTasks.push(task);
    
    // Если все ингредиенты доступны, списываем их со склада
    if (allAvailable) {
        recipe.ingredients.forEach(recipeIng => {
            const ingredient = ingredients.find(i => i.id === recipeIng.ingredientId);
            if (ingredient) {
                const neededAmount = (recipeIng.amount / 1000) * quantity;
                ingredient.stock -= neededAmount;
            }
        });
    }
    
    saveToStorage();
    closeModal('productionModal');
    renderProduction();
    renderIngredients(); // Обновляем отображение ингредиентов
}

function changeProductionStatus(taskId) {
    const task = productionTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const statuses = [
        { value: 'pending', label: 'Ожидает' },
        { value: 'in-progress', label: 'В производстве' },
        { value: 'completed', label: 'Завершено' },
        { value: 'cancelled', label: 'Отменено' }
    ];
    
    const currentIndex = statuses.findIndex(s => s.value === task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    
    task.status = statuses[nextIndex].value;
    saveToStorage();
    renderProduction();
}

function deleteProductionTask(id) {
    if (confirm('Удалить эту производственную задачу?')) {
        productionTasks = productionTasks.filter(t => t.id !== id);
        saveToStorage();
        renderProduction();
    }
}

// ============= ЭКСПОРТ В EXCEL =============
function exportRecipesToExcel() {
    if (recipes.length === 0) {
        alert('Нет рецептов для экспорта');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Создаем данные для экспорта
    const data = [];
    data.push(['Название рецепта', 'Тип', 'Ингредиенты', 'Себестоимость за кг', 'Дата создания']);
    
    recipes.forEach(recipe => {
        const typeLabels = {
            beef: 'Говядина',
            chicken: 'Курица',
            salmon: 'Лосось',
            light: 'Лайт'
        };
        
        const ingredientsList = recipe.ingredients.map(ing => 
            `${ing.name} (${ing.amount}г)`
        ).join(', ');
        
        data.push([
            recipe.name,
            typeLabels[recipe.type],
            ingredientsList,
            recipe.costPerKg.toFixed(2) + ' ₽',
            new Date(recipe.createdAt).toLocaleDateString('ru-RU')
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Рецепты');
    
    XLSX.writeFile(wb, `Рецепты_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportProductionToExcel() {
    if (productionTasks.length === 0) {
        alert('Нет производственных задач для экспорта');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Создаем данные для экспорта
    const data = [];
    data.push(['Номер партии', 'Рецепт', 'Количество (кг)', 'Себестоимость', 'Дата создания', 'Статус']);
    
    productionTasks.forEach(task => {
        const recipe = recipes.find(r => r.id === task.recipeId);
        const recipeName = recipe ? recipe.name : 'Неизвестно';
        
        const statusLabels = {
            pending: 'Ожидает',
            'in-progress': 'В производстве',
            completed: 'Завершено',
            cancelled: 'Отменено'
        };
        
        data.push([
            task.batchNumber,
            recipeName,
            task.quantity,
            task.totalCost.toFixed(2) + ' ₽',
            new Date(task.createdAt).toLocaleDateString('ru-RU'),
            statusLabels[task.status]
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Производство');
    
    XLSX.writeFile(wb, `Производство_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ============= ОБНОВЛЕНИЕ ВЫПАДАЮЩИХ СПИСКОВ =============
function updateAllDropdowns() {
    // Обновляем все выпадающие списки при изменении данных
    setTimeout(() => {
        if (document.getElementById('orderCustomer')) {
            loadCustomersForOrder();
        }
        if (document.getElementById('orderProductSelect')) {
            loadProductsForOrder();
        }
        if (document.getElementById('recipeIngredientSelect')) {
            loadIngredientsForRecipe();
        }
        if (document.getElementById('productionRecipe')) {
            loadRecipesForProduction();
        }
    }, 100);
}