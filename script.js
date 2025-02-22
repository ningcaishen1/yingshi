let resources = [];
let currentPage = 1;
const itemsPerPage = 10;

// 清理输入的函数
function sanitizeInput(input) {
    return input.replace(/[<>&"']/g, ''); // 移除 < > & " ' 等危险字符
}

fetch('resources.json')
    .then(response => response.json())
    .then(data => {
        resources = data;
        searchResources(); // 初始加载第一页
    })
    .catch(error => console.error('加载 JSON 失败:', error));

function searchResources() {
    let query = document.getElementById('searchBox').value.slice(0, 100).toLowerCase(); // 限制 100 字符
    query = sanitizeInput(query); // 清理输入
    const filtered = resources.filter(r => r.title.toLowerCase().includes(query));
    const list = document.getElementById('resourceList');
    list.innerHTML = '';

    if (filtered.length === 0) {
        const noResult = document.createElement('div');
        noResult.className = 'no-result';
        noResult.innerText = '抱歉，没有找到相关资源！';
        list.appendChild(noResult);
    } else {
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filtered.slice(start, end);

        paginatedItems.forEach(resource => {
            const div = document.createElement('div');
            div.className = 'resource-item';
            div.innerText = resource.title;
            div.onclick = () => window.location.href = `resource.html?id=${resource.id}`;
            list.appendChild(div);
        });

        updatePagination(totalPages);
    }
}

function changePage(page) {
    const totalPages = Math.ceil(resources.filter(r => r.title.toLowerCase().includes(document.getElementById('searchBox').value.toLowerCase())).length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        searchResources();
    }
}

function updatePagination(totalPages) {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    pageInfo.innerText = `${currentPage}/${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function showResourceDetails(id) {
    fetch('resources.json')
        .then(response => response.json())
        .then(data => {
            const resource = data.find(r => r.id == id);
            if (resource) {
                document.getElementById('resourceTitle').innerText = resource.title;
                document.getElementById('resourceDesc').innerText = resource.description;
                document.getElementById('downloadLink').href = resource.link;
            }
        });
}