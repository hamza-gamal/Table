/**
 * ═══════════════════════════════════════════════════════════════════
 * نظام الجداول المتعددة (Table Hub)
 * إدارة وتخصيص نسخ الجداول مع دعم الثيمين (أحمر/أسود وأحمر/أبيض)
 * وحفظ البيانات تلقائياً في localStorage
 * ═══════════════════════════════════════════════════════════════════
 */

// المفاتيح المستخدمة في التخزين المحلي (LocalStorage)
const STORAGE_KEY = "table_hub_app_data_v1";
const THEME_KEY = "table_hub_theme_mode";

// الحالة العامة للتطبيق (Application State)
let state = {
  theme: "dark", // 'dark' (أحمر وأسود) | 'light' (أحمر وأبيض)
  viewMode: "focused", // 'focused' (جدول واحد مركز) | 'grid' (عرض كل النسخ)
  activeTableId: 1,
  totalCopies: 5, // عدد النسخ الحالية (5، 10، 15، إلخ)
  tables: [],
};

// قالب افتراضي لجدول جديد
function createDefaultTable(id, indexNumber) {
  return {
    id: id,
    title: `نسخة ${indexNumber}: جدول البيانات`,
    widthPercent: 100,
    cellHeight: 44,
    headers: ["الاسم / البيان", "القسم / الفئة", "القيمة / العدد", "التاريخ", "الحالة / ملاحظات"],
    rows: [
      ["عنصر رقم 1", "مبيعات", "1,500", "2026-11-01", "مكتمل"],
      ["عنصر رقم 2", "تسويق", "3,200", "2026-11-05", "قيد المراجعة"],
      ["عنصر رقم 3", "تطوير", "4,800", "2026-11-10", "نشط"],
      ["عنصر رقم 4", "خدمات", "950", "2026-11-12", "جاهز"],
    ],
  };
}

// ── تهيئة البيانات الأولية (Initialization) ──
function initData() {
  // استرجاع الثيم
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    state.theme = savedTheme;
  }
  applyTheme(state.theme);

  // استرجاع بيانات الجداول من LocalStorage
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed.tables) && parsed.tables.length > 0) {
        state.tables = parsed.tables;
        state.totalCopies = parsed.totalCopies || parsed.tables.length;
        state.activeTableId = parsed.activeTableId || parsed.tables[0].id;
        state.viewMode = parsed.viewMode || "focused";
        return;
      }
    } catch (e) {
      console.error("فشل قراءة البيانات المحفوظة، سيتم إنشاء الجداول الافتراضية:", e);
    }
  }

  // إذا لم توجد بيانات، أنشئ 5 نسخ افتراضية
  state.tables = [];
  state.totalCopies = 5;
  for (let i = 1; i <= 5; i++) {
    state.tables.push(createDefaultTable(i, i));
  }
  state.activeTableId = 1;
  saveData();
}

// ── حفظ البيانات في LocalStorage ──
function saveData() {
  const payload = {
    tables: state.tables,
    totalCopies: state.totalCopies,
    activeTableId: state.activeTableId,
    viewMode: state.viewMode,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

// ── تطبيق وتغيير الثيم (Dark / Light) ──
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const themeLabel = document.querySelector(".theme-label");
  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "الدارك مود" : "اللايت مود";
  }
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme(state.theme);
  showToast(`تم التبديل إلى وضع ${state.theme === "dark" ? "الدارك مود (أحمر وأسود)" : "اللايت مود (أحمر وأبيض)"}`);
}

// ── إظهار تنبيه توست سريع (Toast Notification) ──
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

// ═══════════════════════════════════════════════════════════════════
// إدارة التوسيع والتراجع للنسخ (More +5 & Undo -5)
// ═══════════════════════════════════════════════════════════════════
function addMoreCopies(count = 5) {
  const startNum = state.tables.length + 1;
  const newTables = [];

  for (let i = 0; i < count; i++) {
    const nextId = Date.now() + i;
    const num = startNum + i;
    newTables.push(createDefaultTable(nextId, num));
  }

  state.tables.push(...newTables);
  state.totalCopies = state.tables.length;
  saveData();
  renderApp();
  showToast(`✨ تمت إضافة ${count} نسخ جديدة بنجاح! الإجمالي: ${state.totalCopies} نسخة`);
}

function undoCopies(count = 5) {
  if (state.tables.length <= 5) {
    showToast("⚠️ لا يمكن التقليص، الحد الأدنى هو 5 نسخ!");
    return;
  }

  // حذف آخر 5 نسخ
  state.tables.splice(state.tables.length - count, count);
  state.totalCopies = state.tables.length;

  // التأكد من أن الجدول النشط لا يزال موجوداً
  const exists = state.tables.some((t) => t.id === state.activeTableId);
  if (!exists) {
    state.activeTableId = state.tables[0].id;
  }

  saveData();
  renderApp();
  showToast(`↩️ تم التراجع وإزالة ${count} نسخ. الإجمالي الحالي: ${state.totalCopies} نسخة`);
}

// ═══════════════════════════════════════════════════════════════════
// ريندر شريط التابات والتنقل (Render Tabs)
// ═══════════════════════════════════════════════════════════════════
function renderTabs() {
  const container = document.getElementById("tabsContainer");
  const summaryBadge = document.getElementById("tabsSummaryBadge");
  const counterNumber = document.getElementById("copiesCounterNumber");
  const undoBtn = document.getElementById("undoBtn");

  if (summaryBadge) {
    summaryBadge.innerHTML = `<i class="fa-solid fa-layer-group"></i> <span>${state.totalCopies} نسخ نشطة</span>`;
  }
  if (counterNumber) {
    counterNumber.textContent = state.totalCopies;
  }
  if (undoBtn) {
    undoBtn.disabled = state.tables.length <= 5;
  }

  if (!container) return;
  container.innerHTML = "";

  state.tables.forEach((table, index) => {
    const tab = document.createElement("button");
    tab.className = `tab-item ${state.activeTableId === table.id && state.viewMode === "focused" ? "active" : ""}`;
    tab.title = table.title;
    tab.innerHTML = `
      <i class="fa-solid fa-table"></i>
      <span>نسخة ${index + 1}</span>
    `;

    tab.addEventListener("click", () => {
      state.activeTableId = table.id;
      if (state.viewMode === "grid") {
        state.viewMode = "focused";
        updateViewToggleBtn();
      }
      saveData();
      renderApp();
      // التمرير السلس إلى الجدول
      const targetCard = document.getElementById(`table-card-${table.id}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    container.appendChild(tab);
  });
}

// ═══════════════════════════════════════════════════════════════════
// ريندر كروت الجداول ومساحة العمل (Render Tables Workspace)
// ═══════════════════════════════════════════════════════════════════
function renderWorkspace() {
  const workspace = document.getElementById("tableWorkspace");
  if (!workspace) return;
  workspace.innerHTML = "";

  // تحديد الجداول المطلوب عرضها بناء على وضع العرض
  let tablesToDisplay = [];
  if (state.viewMode === "grid") {
    workspace.classList.add("grid-view");
    tablesToDisplay = state.tables;
  } else {
    workspace.classList.remove("grid-view");
    const active = state.tables.find((t) => t.id === state.activeTableId) || state.tables[0];
    tablesToDisplay = [active];
  }

  tablesToDisplay.forEach((table) => {
    const globalIndex = state.tables.findIndex((t) => t.id === table.id) + 1;
    const card = createTableCardElement(table, globalIndex);
    workspace.appendChild(card);
  });
}

// إنشاء عنصر بطاقة جدول كاملة
function createTableCardElement(table, globalIndex) {
  const card = document.createElement("div");
  card.className = "table-card";
  card.id = `table-card-${table.id}`;

  // 1. رأس البطاقة (Header)
  const header = document.createElement("div");
  header.className = "table-card-header";
  header.innerHTML = `
    <div class="table-meta-box">
      <span class="table-index-badge">نسخة #${globalIndex}</span>
      <input type="text" class="table-title-editable" value="${escapeHtml(table.title)}" title="انقر لتعديل عنوان النسخة" />
      <span class="table-counts">(${table.rows.length} صفوف × ${table.headers.length} أعمدة)</span>
    </div>
    <div class="table-actions-top">
      <button class="mod-btn duplicate-btn" title="تكرار هذه النسخة">
        <i class="fa-solid fa-copy"></i>
        <span>تكرار</span>
      </button>
      <button class="mod-btn export-csv-btn" title="تصدير كملف Excel / CSV">
        <i class="fa-solid fa-file-csv"></i>
        <span>CSV</span>
      </button>
      <button class="mod-btn print-btn" title="طباعة الجدول">
        <i class="fa-solid fa-print"></i>
        <span>طباعة</span>
      </button>
      <button class="mod-btn danger-btn clear-btn" title="تفريغ محتويات الجدول">
        <i class="fa-solid fa-trash-can"></i>
        <span>تفريغ</span>
      </button>
    </div>
  `;

  // تعديل عنوان الجدول
  const titleInput = header.querySelector(".table-title-editable");
  titleInput.addEventListener("change", (e) => {
    table.title = e.target.value.trim() || `نسخة ${globalIndex}: جدول البيانات`;
    saveData();
    renderTabs();
    showToast("💾 تم حفظ عنوان الجدول بنجاح!");
  });

  // 2. شريط التحكم بالأبعاد والتحجيم (Dimension Controls Bar)
  const dimBar = document.createElement("div");
  dimBar.className = "table-dimension-bar";
  dimBar.innerHTML = `
    <!-- تحكم في العرض -->
    <div class="dimension-slider-group">
      <span class="slider-label"><i class="fa-solid fa-arrows-left-right"></i> عرض الجدول:</span>
      <input type="range" class="dimension-slider width-slider" min="50" max="100" value="${table.widthPercent || 100}" />
      <span class="slider-val-badge width-val">${table.widthPercent || 100}%</span>
    </div>

    <!-- تحكم في ارتفاع الخلايا -->
    <div class="dimension-slider-group">
      <span class="slider-label"><i class="fa-solid fa-arrows-up-down"></i> تباعد الصفوف:</span>
      <input type="range" class="dimension-slider height-slider" min="32" max="68" value="${table.cellHeight || 44}" />
      <span class="slider-val-badge height-val">${table.cellHeight || 44}px</span>
    </div>

    <!-- أزرار الإضافة والتعديل السريع -->
    <div class="table-grid-modifiers">
      <button class="mod-btn add-row-btn" title="إضافة صف جديد للجدول">
        <i class="fa-solid fa-plus"></i> صف
      </button>
      <button class="mod-btn danger-btn remove-row-btn" title="حذف آخر صف">
        <i class="fa-solid fa-minus"></i> صف
      </button>
      <button class="mod-btn add-col-btn" title="إضافة عمود جديد للجدول">
        <i class="fa-solid fa-plus"></i> عمود
      </button>
      <button class="mod-btn danger-btn remove-col-btn" title="حذف آخر عمود">
        <i class="fa-solid fa-minus"></i> عمود
      </button>
    </div>
  `;

  // 3. الجدول الفعلي (Responsive Table Wrapper)
  const wrapper = document.createElement("div");
  wrapper.className = "table-responsive-wrapper";
  wrapper.style.width = `${table.widthPercent || 100}%`;

  const dataTable = document.createElement("table");
  dataTable.className = "custom-data-table";

  // بناء رأس الجدول (THEAD)
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");

  // عمود الترقيم #
  const thIndex = document.createElement("th");
  thIndex.className = "col-index";
  thIndex.textContent = "#";
  trHead.appendChild(thIndex);

  // رؤوس الأعمدة القابلة للتعديل
  table.headers.forEach((hText, colIndex) => {
    const th = document.createElement("th");
    th.innerHTML = `
      <div class="th-content">
        <input type="text" class="th-input" value="${escapeHtml(hText)}" title="انقر لتعديل اسم العمود" />
      </div>
    `;

    const thInput = th.querySelector(".th-input");
    thInput.addEventListener("change", (e) => {
      table.headers[colIndex] = e.target.value.trim() || `عمود ${colIndex + 1}`;
      saveData();
      showToast("💾 تم تحديث اسم العمود!");
    });

    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  dataTable.appendChild(thead);

  // بناء جسم الجدول (TBODY)
  const tbody = document.createElement("tbody");
  table.rows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    // خلية رقم الصف
    const tdIndex = document.createElement("td");
    tdIndex.className = "cell-index";
    tdIndex.textContent = rowIndex + 1;
    tr.appendChild(tdIndex);

    // خلايا البيانات القابلة للتحرير المباشر
    table.headers.forEach((_, colIndex) => {
      const td = document.createElement("td");
      const cellVal = row[colIndex] !== undefined ? row[colIndex] : "";

      const editableDiv = document.createElement("div");
      editableDiv.className = "cell-editable";
      editableDiv.contentEditable = "true";
      editableDiv.spellcheck = false;
      editableDiv.textContent = cellVal;
      editableDiv.style.minHeight = `${table.cellHeight || 44}px`;

      // حفظ القيمة عند انتهاء التعديل
      editableDiv.addEventListener("blur", () => {
        const newVal = editableDiv.textContent.trim();
        table.rows[rowIndex][colIndex] = newVal;
        saveData();
      });

      // اختصارات لوحة المفاتيح للتنقل بالإنتر
      editableDiv.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          editableDiv.blur();
          // الانتقال للخلية التي في الصف التالي
          const nextRow = tbody.children[rowIndex + 1];
          if (nextRow) {
            const nextCell = nextRow.children[colIndex + 1]?.querySelector(".cell-editable");
            if (nextCell) nextCell.focus();
          }
        }
      });

      td.appendChild(editableDiv);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  dataTable.appendChild(tbody);
  wrapper.appendChild(dataTable);

  // 4. أزرار الفوتر الخاصة بالجدول
  const footerActions = document.createElement("div");
  footerActions.className = "table-footer-actions";
  footerActions.innerHTML = `
    <div style="font-size: 0.85rem; color: var(--text-dim); display: flex; align-items: center; gap: 8px;">
      <i class="fa-solid fa-circle-check" style="color: var(--red-bright);"></i>
      <span>تم الحفظ تلقائياً في التخزين المحلي</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="table-ctrl-btn add-row-quick-btn">
        <i class="fa-solid fa-plus"></i> إضافة صف جديد
      </button>
    </div>
  `;

  // ربط أحداث أزرار التحكم
  // أ) شريط التحجيم العرض
  const widthSlider = dimBar.querySelector(".width-slider");
  const widthValBadge = dimBar.querySelector(".width-val");
  widthSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    table.widthPercent = val;
    widthValBadge.textContent = `${val}%`;
    wrapper.style.width = `${val}%`;
  });
  widthSlider.addEventListener("change", saveData);

  // ب) شريط تباعد الصفوف (الارتفاع)
  const heightSlider = dimBar.querySelector(".height-slider");
  const heightValBadge = dimBar.querySelector(".height-val");
  heightSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    table.cellHeight = val;
    heightValBadge.textContent = `${val}px`;
    wrapper.querySelectorAll(".cell-editable").forEach((cell) => {
      cell.style.minHeight = `${val}px`;
    });
  });
  heightSlider.addEventListener("change", saveData);

  // ج) إضافة صف
  const addRow = () => {
    const newRow = new Array(table.headers.length).fill("");
    table.rows.push(newRow);
    saveData();
    renderWorkspace();
    showToast("➕ تمت إضافة صف جديد!");
  };
  dimBar.querySelector(".add-row-btn").addEventListener("click", addRow);
  footerActions.querySelector(".add-row-quick-btn").addEventListener("click", addRow);

  // د) حذف صف
  dimBar.querySelector(".remove-row-btn").addEventListener("click", () => {
    if (table.rows.length <= 1) {
      showToast("⚠️ لا يمكن حذف المزيد، يجب بقاء صف واحد على الأقل!");
      return;
    }
    table.rows.pop();
    saveData();
    renderWorkspace();
    showToast("➖ تم حذف الصف الأخير!");
  });

  // هـ) إضافة عمود
  dimBar.querySelector(".add-col-btn").addEventListener("click", () => {
    const colName = `عمود ${table.headers.length + 1}`;
    table.headers.push(colName);
    table.rows.forEach((r) => r.push(""));
    saveData();
    renderWorkspace();
    showToast("➕ تمت إضافة عمود جديد!");
  });

  // و) حذف عمود
  dimBar.querySelector(".remove-col-btn").addEventListener("click", () => {
    if (table.headers.length <= 1) {
      showToast("⚠️ لا يمكن حذف المزيد، يجب بقاء عمود واحد على الأقل!");
      return;
    }
    table.headers.pop();
    table.rows.forEach((r) => r.pop());
    saveData();
    renderWorkspace();
    showToast("➖ تم حذف العمود الأخير!");
  });

  // ز) تفريغ الجدول
  header.querySelector(".clear-btn").addEventListener("click", () => {
    if (confirm(`هل أنت متأكد من تفريغ كافة بيانات "${table.title}"؟`)) {
      table.rows = [new Array(table.headers.length).fill("")];
      saveData();
      renderWorkspace();
      showToast("🗑️ تم تفريغ بيانات الجدول!");
    }
  });

  // ح) تكرار الجدول
  header.querySelector(".duplicate-btn").addEventListener("click", () => {
    const clonedTable = JSON.parse(JSON.stringify(table));
    clonedTable.id = Date.now();
    clonedTable.title = `${table.title} (نسخة مكررة)`;
    state.tables.push(clonedTable);
    state.totalCopies = state.tables.length;
    state.activeTableId = clonedTable.id;
    saveData();
    renderApp();
    showToast("📋 تم تكرار الجدول بنجاح!");
  });

  // ط) تصدير كـ CSV
  header.querySelector(".export-csv-btn").addEventListener("click", () => {
    exportTableToCSV(table);
  });

  // ي) طباعة الجدول
  header.querySelector(".print-btn").addEventListener("click", () => {
    printSingleTable(table);
  });

  // تجميع عناصر الكارت
  card.appendChild(header);
  card.appendChild(dimBar);
  card.appendChild(wrapper);
  card.appendChild(footerActions);

  return card;
}

// ═══════════════════════════════════════════════════════════════════
// وظائف التصدير والطباعة (Export & Print Helpers)
// ═══════════════════════════════════════════════════════════════════
function exportTableToCSV(table) {
  let csvContent = "\uFEFF"; // BOM لدعم اللغة العربية في Excel
  // كتابة العناوين
  csvContent += table.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
  // كتابة الصفوف
  table.rows.forEach((row) => {
    const rowLine = row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",");
    csvContent += rowLine + "\r\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${table.title.replace(/[\\/:*?"<>|]/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("📥 تم تحميل ملف CSV بنجاح!");
}

function printSingleTable(table) {
  const printWindow = window.open("", "_blank");
  let tableHtml = `
    <table border="1" cellpadding="8" style="width:100%; border-collapse:collapse; text-align:center; direction:rtl; font-family:sans-serif;">
      <thead>
        <tr style="background:#dc2626; color:white;">
          <th>#</th>
          ${table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${table.rows
          .map(
            (r, i) => `
          <tr>
            <td style="background:#fee2e2; font-weight:bold;">${i + 1}</td>
            ${r.map((c) => `<td>${escapeHtml(c || "")}</td>`).join("")}
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>${escapeHtml(table.title)}</title>
      <style>body { font-family: "Cairo", sans-serif; padding: 20px; }</style>
    </head>
    <body>
      <h2 style="color:#dc2626; text-align:center;">${escapeHtml(table.title)}</h2>
      ${tableHtml}
      <script>window.onload = function() { window.print(); window.close(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ═══════════════════════════════════════════════════════════════════
// أدوات البحث والمساعدة (Search & View Mode Helpers)
// ═══════════════════════════════════════════════════════════════════
function setupSearch() {
  const searchInput = document.getElementById("globalSearchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    const cells = document.querySelectorAll(".cell-editable");

    cells.forEach((cell) => {
      const text = cell.textContent.toLowerCase();
      if (query && text.includes(query)) {
        cell.style.background = "rgba(239, 68, 68, 0.4)";
        cell.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.8)";
      } else {
        cell.style.background = "";
        cell.style.boxShadow = "";
      }
    });
  });
}

function updateViewToggleBtn() {
  const btn = document.getElementById("viewToggleBtn");
  if (!btn) return;
  if (state.viewMode === "grid") {
    btn.innerHTML = `<i class="fa-solid fa-table"></i> <span class="btn-text">عرض مركز</span>`;
    btn.title = "التبديل إلى عرض جدول واحد مركز";
  } else {
    btn.innerHTML = `<i class="fa-solid fa-table-cells-large"></i> <span class="btn-text">عرض الكل</span>`;
    btn.title = "التبديل إلى عرض كل الجداول بجانب بعضها";
  }
}

function setupViewToggle() {
  const btn = document.getElementById("viewToggleBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    state.viewMode = state.viewMode === "focused" ? "grid" : "focused";
    updateViewToggleBtn();
    saveData();
    renderApp();
    showToast(`تم التبديل إلى: ${state.viewMode === "grid" ? "عرض كل الجداول (شبكة)" : "عرض جدول واحد مركز"}`);
  });
}

// تصدير كافّة الجداول كنسخة احتياطية JSON
function setupExportAll() {
  const btn = document.getElementById("exportAllBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tables, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `TableHub_Backup_${state.tables.length}_Tables.json`);
    dlAnchor.click();
    showToast(`💾 تم تصدير بيانات ${state.tables.length} نسخ بنجاح!`);
  });
}

// دالة حماية من الـ XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── الدالة الرئيسية لتحديث كامل الواجهة (Render App) ──
function renderApp() {
  renderTabs();
  renderWorkspace();
  updateViewToggleBtn();
}

// ═══════════════════════════════════════════════════════════════════
// بدء التشغيل (DOM Content Loaded)
// ═══════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  initData();

  // أزرار زيادة وتقليص النسخ (More +5 / Undo -5)
  const moreBtn = document.getElementById("moreBtn");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => addMoreCopies(5));
  }

  const undoBtn = document.getElementById("undoBtn");
  if (undoBtn) {
    undoBtn.addEventListener("click", () => undoCopies(5));
  }

  // زر تبديل الثيم
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }

  setupSearch();
  setupViewToggle();
  setupExportAll();
  renderApp();
});
