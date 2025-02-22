let resources = [];
let currentPage = 1;
const itemsPerPage = 10; // 每页显示 10 条

fetch('resources.json')
    .then(response => response.json())
    .then(data => {
        resources = data;
        searchResources(); // 初始加载时显示第一页
    });

function searchResources() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const filtered = resources.filter(r => r.title.toLowerCase().includes(query));
    const list = document.getElementById('resourceList');
    list.innerHTML = '';

    if (filtered.length === 0) {
        const noResult = document.createElement('div');
        noResult.className = 'no-result';
        noResult.innerText = '抱歉，没有找到相关资源！';
        list.appendChild(noResult);
    } else {
        // 计算分页
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filtered.slice(start, end);

        // 显示当前页的资源
        paginatedItems.forEach(resource => {
            const div = document.createElement('div');
            div.className = 'resource-item';
            div.innerText = resource.title;
            div.onclick = () => window.location.href = `resource.html?id=${resource.id}`;
            list.appendChild(div);
        });

        // 添加分页控件
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.innerHTML = `
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
            <span>第 ${currentPage} 页 / 共 ${totalPages} 页</span>
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
        `;
        list.appendChild(pagination);
    }
}

function changePage(page) {
    currentPage = page;
    searchResources();
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