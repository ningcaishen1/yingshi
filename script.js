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
    list.innerHTML = '';
    filtered.forEach(resource => {
        const div = document.createElement('div');
        div.className = 'resource-item';
        div.innerText = resource.title;
        div.onclick = () => window.location.href = `resource.html?id=${resource.id}`;
        list.appendChild(div);
    });
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
                document.getElementById('downloadLink').href = resource.link;
            }
        });
}