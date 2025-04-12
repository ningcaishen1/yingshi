let resources = [];
let currentPage = 1;
const itemsPerPage = 10;

function sanitizeInput(input) {
  return input.replace(/[<>&"']/g, '');
}

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

function searchResources() {
  let query = document.getElementById('searchBox').value.slice(0, 100).toLowerCase();
  query = sanitizeInput(query);
  const filtered = query ? resources.filter(r => r.title.toLowerCase().includes(query)) : resources;
  console.log('资源总数:', resources.length, '过滤后数量:', filtered.length, '当前页:', currentPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (query) {
    currentPage = 1;
  }

  updatePagination(totalPages);

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = filtered.slice(start, end);

  renderResourceList(paginatedItems);
}

function changePage(page) {
  if (page >= 1) {
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
        const titleElement = document.getElementById('resourceTitle');
        titleElement.innerText = resource.title;
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
  const oneHour = 5 * 60 * 60 * 1000;
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

function resetToHomePage() {
  document.getElementById('searchBox').value = '';
  currentPage = 1;
  searchResources();
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('resources.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('无法加载 resources.json，状态码: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      resources = data;
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('query') || '';
      const page = parseInt(urlParams.get('page')) || 1;
      currentPage = page;
      document.getElementById('searchBox').value = query;
      searchResources();
    })
    .catch(error => {
      console.error('加载 JSON 失败:', error);
      document.getElementById('resourceList').innerHTML = '<div class="no-result">加载资源失败，请检查网络或文件路径。</div>';
    });
  showReminderPopup();
});