let resources = [];
let currentPage = 1;
const itemsPerPage = 10;

// 清理输入，防止危险字符
function sanitizeInput(input) {
  return input.replace(/[<>&"']/g, '');
}

// 渲染资源列表
function renderResourceList(resources) {
  const list = document.getElementById('resourceList');
  if (!list) return; // 防止在 resource.html 中执行
  list.innerHTML = '';

  console.log('渲染资源列表，资源数量:', resources.length); // 调试日志

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
    if (resource.boldTitle) {
      div.style.fontWeight = 'bold';
    }
    div.onclick = () => {
      let query = document.getElementById('searchBox')?.value.slice(0, 100).toLowerCase() || '';
      query = sanitizeInput(query);
      const returnUrl = `index.html?query=${encodeURIComponent(query)}&page=${currentPage}`;
      window.location.href = `resource.html?id=${resource.id}&return=${encodeURIComponent(returnUrl)}`;
    };
    list.appendChild(div);
  });
}

// 搜索资源
function searchResources() {
  const searchBox = document.getElementById('searchBox');
  if (!searchBox) return;
  let query = searchBox.value.slice(0, 100).toLowerCase();
  query = sanitizeInput(query);
  const filtered = query ? resources.filter(r => r.title.toLowerCase().includes(query)) : resources;
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  updatePagination(totalPages);

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = filtered.slice(start, end);

  renderResourceList(paginatedItems);
}

// 切换页面
function changePage(page) {
  if (page >= 1) {
    currentPage = page;
    searchResources();
  }
}

function handleSearch() {
  currentPage = 1; // 仅在主动搜索时重置页码
  searchResources();
}

// 更新分页信息
function updatePagination(totalPages) {
  const pageInfo = document.getElementById('pageInfo');
  if (!pageInfo) return;
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  pageInfo.innerText = `${currentPage}/${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= totalPages; // 使用 >= 更安全
}

// 显示资源详情
function showResourceDetails(id) {
  fetch('resources.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('无法加载 resources.json，状态码: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log('资源详情数据加载完成，ID:', id); // 调试日志
      const resource = data.find(r => r.id == id);
      if (resource) {
        const titleElement = document.getElementById('resourceTitle');
        if (titleElement) {
          titleElement.innerText = resource.title;
          if (resource.boldTitle) {
            titleElement.style.fontWeight = 'bold';
          }
        }
        const descElement = document.getElementById('resourceDesc');
        if (descElement) {
          descElement.innerText = resource.description;
        }
        const downloadLinksDiv = document.getElementById('downloadLinks');
        if (downloadLinksDiv) {
          downloadLinksDiv.innerHTML = '';
          if (!resource.links || resource.links.length === 0) {
            downloadLinksDiv.innerHTML = '暂无下载链接';
          } else {
            resource.links.forEach(linkObj => {
              const a = document.createElement('a');
              a.href = linkObj.url;
              a.target = '_blank';
              a.className = 'download-btn';
              a.innerHTML = `${linkObj.label}`;
              downloadLinksDiv.appendChild(a);
            });
          }
        }
      } else {
        console.warn('未找到资源，ID:', id); // 调试日志
        const downloadLinksDiv = document.getElementById('downloadLinks');
        if (downloadLinksDiv) {
          downloadLinksDiv.innerHTML = '<div class="no-result">未找到该资源，请联系微信：XTX0447，加群。群中资源更多。</div>';
        }
      }
    })
    .catch(error => {
      console.error('加载资源详情失败:', error);
      const downloadLinksDiv = document.getElementById('downloadLinks');
      if (downloadLinksDiv) {
        downloadLinksDiv.innerHTML = '<div class="no-result">加载资源详情失败，请检查网络或文件路径。</div>';
      }
    });
}

// 显示提醒弹窗
function showReminderPopup() {
  const modal = document.getElementById('reminderModal');
  if (!modal) return; // 防止在 resource.html 中执行
  const lastShown = localStorage.getItem('reminderLastShown');
  const now = new Date().getTime();
  const oneHour = 5 * 60 * 60 * 1000; // 5 小时
  if (!lastShown || now - lastShown > oneHour) {
    modal.style.display = 'block';
    localStorage.setItem('reminderLastShown', now);
  }
}

// 关闭提醒弹窗
function closeReminderPopup() {
  const modal = document.getElementById('reminderModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 重置到首页
function resetToHomePage() {
  const searchBox = document.getElementById('searchBox');
  if (!searchBox) return; // 防止在 resource.html 中执行
  searchBox.value = '';
  currentPage = 1;
  searchResources();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  // 仅在 index.html 中执行搜索相关逻辑
  if (document.getElementById('searchBox') && document.getElementById('resourceList')) {
    console.log('开始加载 index.html'); // 调试日志
    fetch('resources.json')
      .then(response => {
        console.log('fetch 状态:', response.status); // 调试日志
        if (!response.ok) {
          throw new Error('无法加载 resources.json，状态码: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log('资源数据加载完成，长度:', data.length); // 调试日志
        resources = data;
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query') || '';
        const page = parseInt(urlParams.get('page')) || 1;
        currentPage = page;
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
          searchBox.value = query;
        }
        searchResources();
      })
      .catch(error => {
        console.error('加载 JSON 失败:', error);
        const resourceList = document.getElementById('resourceList');
        if (resourceList) {
          resourceList.innerHTML = '<div class="no-result">加载资源失败，请检查网络或文件路径。</div>';
        }
      });
    showReminderPopup();
  }
});