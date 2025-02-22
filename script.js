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
        searchResources(); // 初始加载第一页
    })
    .catch(error => console.error('加载 JSON 失败:', error));

// 搜索资源
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
                document.getElementById('resourceTitle').innerText = resource.title;
                document.getElementById('resourceDesc').innerText = resource.description;
                const downloadLinksDiv = document.getElementById('downloadLinks');
                downloadLinksDiv.innerHTML = ''; // 清空现有内容
                if (!resource.links || resource.links.length === 0) {
                    downloadLinksDiv.innerHTML = '<p>暂无下载链接</p>';
                } else {
                    resource.links.forEach(linkObj => {
                        const a = document.createElement('a');
                        a.href = linkObj.url;
                        a.target = "_blank";
                        a.className = "download-btn";
                        a.innerHTML = `<i class="fas fa-download"></i> ${linkObj.label}`;
                        downloadLinksDiv.appendChild(a);
                    });
                }
            }
        })
        .catch(error => console.error('加载资源详情失败:', error));
}