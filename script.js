let resources = [];
let currentPage = 1;
const itemsPerPage = 10;

fetch('resources.json')
    .then(response => response.json())
    .then(data => {
        resources = data;
        searchResources(); // 初始加载第一页
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

        // 显示当前页资源
        paginatedItems.forEach(resource => {
            const div = document.createElement('div');
            div.className = 'resource-item';
            div.innerText = resource.title;
            div.onclick = () => window.location.href = `resource.html?id=${resource.id}`;
            list.appendChild(div);
        });

        // 更新分页控件
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

    pageInfo.innerText = `${currentPage}/${totalPages}`; // 只显示数字，如 1/1
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