// 加载资源数据
let resources = [];
fetch('resources.json')
    .then(response => response.json())
    .then(data => resources = data);

// 搜索功能
function searchResources() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const filtered = resources.filter(r => r.title.toLowerCase().includes(query));
    const list = document.getElementById('resourceList');
    list.innerHTML = ''; // 清空现有内容

    if (filtered.length === 0) {
        // 如果没有找到资源，显示提示
        const noResult = document.createElement('div');
        noResult.className = 'no-result';
        noResult.innerText = '抱歉，没有找到相关资源！';
        list.appendChild(noResult);
    } else {
        // 显示搜索结果
        filtered.forEach(resource => {
            const div = document.createElement('div');
            div.className = 'resource-item';
            div.innerText = resource.title;
            div.onclick = () => window.location.href = `resource.html?id=${resource.id}`;
            list.appendChild(div);
        });
    }
}

// 显示资源详情（保持不变）
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