let resources = [];
let currentPage = 1;
const itemsPerPage = 10;

// 清理输入的函数，防止危险字符
function sanitizeInput(input) {
    return input.replace(/[<>&"']/g, ''); // 移除 < > & " ' 等字符
}

// 加载资源数据
fetch('resources.json')
    .then(response => response.json())
    .then(data => {
        resources = data;
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query') || '';
        const page = parseInt(urlParams.get('page')) || 1;
        document.getElementById('searchBox').value = query;
        currentPage = page;
        searchResources();
    })
    .catch(error => console.error('加载 JSON 失败:', error));

// 搜索资源
function searchResources() {
    let query = document.getElementById('searchBox').value.slice(0, 100).toLowerCase();
    query = sanitizeInput(query);
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
            if (resource.boldTitle) {
                div.style.fontWeight = 'bold';
            }
            div.onclick = () => {
                const returnUrl = `index.html?query=${encodeURIComponent(query)}&page=${currentPage}`;
                window.location.href = `resource.html?id=${resource.id}&return=${encodeURIComponent(returnUrl)}`;
            };
            list.appendChild(div);
        });

        updatePagination(totalPages);
    }
}

// 切换页面
function changePage(page) {
    const totalPages = Math.ceil(resources.filter(r => r.title.toLowerCase().includes(document.getElementById('searchBox').value.toLowerCase())).length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        searchResources();
    }
}

// 更新分页信息
function updatePagination(totalPages) {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    pageInfo.innerText = `${currentPage}/${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// 显示资源详情
function showResourceDetails(id) {
    fetch('resources.json')
        .then(response => response.json())
        .then(data => {
            const resource = data.find(r => r.id == id);
            if (resource) {
                const titleElement = document.getElementById('resourceTitle');
                titleElement.innerText = resource.title;
                if (resource.boldTitle) {
                    titleElement.style.fontWeight = 'bold';
                }
                document.getElementById('resourceDesc').innerText = resource.description;
                const downloadLinksDiv = document.getElementById('downloadLinks');
                downloadLinksDiv.innerHTML = '';
                if (!resource.links || resource.links.length === 0) {
                    downloadLinksDiv.innerHTML = '<p>暂无下载链接</p>';
                } else {
                    resource.links.forEach(linkObj => {
                        const a = document.createElement('a');
                        a.href = linkObj.url;
                        a.target = "_blank";
                        a.className = "download-btn";
                        // 添加迅雷图标（使用 Font Awesome 的下载图标）
                        a.innerHTML = ` ${linkObj.label}`;
                        downloadLinksDiv.appendChild(a);
                    });
                }
            }
        })
        .catch(error => console.error('加载资源详情失败:', error));
}