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
    // 检查 URL 参数，恢复状态
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query') || '';
    const page = parseInt(urlParams.get('page')) || 1;
    currentPage = page;

    // 等待 DOM 加载完成后设置 searchBox 的值并调用 searchResources
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('searchBox').value = query;
      searchResources(); // 加载对应页面
    });
  })
  .catch(error => console.error('加载 JSON 失败:', error));

// 渲染资源列表函数
function renderResourceList(resources) {
  const list = document.getElementById('resourceList');
  list.innerHTML = '';

  if (resources.length === 0) {
    const noResult = document.createElement('div');
    noResult.className = 'no-result';
    noResult.innerText = '抱歉，没有找到相关资源！';
    list.appendChild(noResult);
    return;
  }

  resources.forEach(resource => {
    const div = document.createElement('div');
    div.className = 'resource-item';
    div.innerText = resource.title;
    // 如果 boldTitle 为 true，添加加粗样式
    if (resource.boldTitle) {
      div.style.fontWeight = 'bold';
    }
    div.onclick = () => {
      let query = document.getElementById('searchBox').value.slice(0, 100).toLowerCase();
      query = sanitizeInput(query);
      const returnUrl = `index.html?query=${encodeURIComponent(query)}&page=${currentPage}`;
      window.location.href = `resource.html?id=${resource.id}&return=${encodeURIComponent(returnUrl)}`;
    };
    list.appendChild(div);
  });
}

// 搜索资源
function searchResources() {
  let query = document.getElementById('searchBox').value.slice(0, 100).toLowerCase();
  query = sanitizeInput(query);
  const filtered = query ? resources.filter(r => r.title.toLowerCase().includes(query)) : resources;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // 如果执行了搜索，则重置 currentPage 为 1
  if (query) {
    currentPage = 1;
  }

  updatePagination(totalPages); // 更新分页按钮状态

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = filtered.slice(start, end);

  renderResourceList(paginatedItems);
}

// 切换页面
function changePage(page) {
  if (page >= 1) {
    currentPage = page;
    searchResources(); // 重复搜索来加载对应页面
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
        // 如果 boldTitle 为 true，加粗标题
        if (resource.boldTitle) {
          titleElement.style.fontWeight = 'bold';
        }
        document.getElementById('resourceDesc').innerText = resource.description;
        const downloadLinksDiv = document.getElementById('downloadLinks');
        downloadLinksDiv.innerHTML = '';
        if (!resource.links || resource.links.length === 0) {
          downloadLinksDiv.innerHTML = '暂无下载链接';
        } else {
          resource.links.forEach(linkObj => {
            const a = document.createElement('a');
            a.href = linkObj.url;
            a.target = "_blank";
            a.className = "download-btn";
            a.innerHTML = `${linkObj.label}`;
            downloadLinksDiv.appendChild(a);
          });
        }
      }
    })
    .catch(error => console.error('加载资源详情失败:', error));
}

function showReminderPopup() {
  const lastShown = localStorage.getItem('reminderLastShown');
  const now = new Date().getTime();
  const oneHour = 5 * 60 * 60 * 1000; // 5 分钟
  if (!lastShown || now - lastShown > oneHour) {
    const modal = document.getElementById('reminderModal');
    modal.style.display = 'block';
    localStorage.setItem('reminderLastShown', now);
  }
}

function closeReminderPopup() {
  const modal = document.getElementById('reminderModal');
  modal.style.display = 'none';
}

// 在页面加载完成后调用相关函数
document.addEventListener('DOMContentLoaded', () => {
  showReminderPopup();
});

function resetToHomePage() {
  document.getElementById('searchBox').value = ''; // 清空搜索框
  currentPage = 1; // 重置到第一页
  searchResources(); // 显示所有资源
}