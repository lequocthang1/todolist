const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const deleteSelectedButton = document.getElementById("delete-selected");
const selectAllCheckbox = document.getElementById("select-all");
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const saveEditButton = document.getElementById("save-edit-button");
const closeEditModalButton = document.getElementById("close-edit-modal");

let todos = [];
let currentEditingTodoId = null;

// Fetch existing tasks from MockAPI
fetch("https://6752728bd1983b9597b6399b.mockapi.io/api/List")
  .then((response) => response.json())
  .then((data) => {
    todos = data;
    renderTodos();
  });

// Add new task
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newTodo = { text: input.value, completed: false };

  fetch("https://6752728bd1983b9597b6399b.mockapi.io/api/List", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  })
    .then((response) => response.json())
    .then((todo) => {
      todos.push(todo);
      renderTodos();
      input.value = "";
    });
});

// Render tasks
function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center mb-2";

    const leftContainer = document.createElement("div");
    leftContainer.className = "flex items-center";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = todo.id;

    const span = document.createElement("span");
    span.textContent = todo.text;
    span.className = todo.completed
      ? "line-through text-gray-500 ml-2"
      : "ml-2";

    leftContainer.appendChild(checkbox);
    leftContainer.appendChild(span);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "flex space-x-2";

    // Nút mới không có chức năng
    const newButton = document.createElement("button");

    // Lấy giá trị từ localStorage với key là id của todo
    newButton.textContent =
      localStorage.getItem(`selectedOption_${todo.id}`) || "Trạng thái";
    newButton.className =
      "p-1 bg-gray-300 text-black rounded hover:bg-gray-400";

    // Tạo dropdown
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className =
      "hidden absolute bg-white shadow-lg rounded-lg mt-1"; // Ẩn ban đầu
    dropdownMenu.style.listStyleType = "none"; // Không có dấu đầu dòng

    // Thêm các mục vào dropdown và gán sự kiện click
    const options = ["Hoàn thành", "Đang làm", "Hoãn"];

    options.forEach((option) => {
      const listItem = document.createElement("li");
      listItem.textContent = option;
      listItem.className = "p-2 hover:bg-gray-200 cursor-pointer"; // Thêm kiểu cho mục

      // Gán sự kiện click để thay đổi nội dung nút và lưu vào localStorage
      listItem.addEventListener("click", () => {
        newButton.textContent = option; // Thay đổi nội dung của nút mới
        localStorage.setItem(`selectedOption_${todo.id}`, option); // Lưu lựa chọn vào localStorage với key duy nhất
        dropdownMenu.classList.add("hidden"); // Ẩn dropdown sau khi chọn
      });

      dropdownMenu.appendChild(listItem);
    });

    // Thêm sự kiện click cho nút mới
    newButton.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden"); // Chuyển đổi giữa hiển thị và ẩn
    });

    buttonContainer.appendChild(newButton); // Thêm nút mới vào buttonContainer
    buttonContainer.appendChild(dropdownMenu); // Thêm dropdown vào buttonContainer

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className =
      "p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600";

    editButton.onclick = () => openEditModal(todo.id);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className =
      "p-1 bg-red-500 text-white rounded hover:bg-red-600";

    deleteButton.onclick = () => deleteTodo(todo.id);

    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    li.appendChild(leftContainer);
    li.appendChild(buttonContainer);

    todoList.appendChild(li);
  });

  updateSelectAllCheckbox();
}
// Open edit modal
function openEditModal(id) {
  currentEditingTodoId = id;
  const todoToEdit = todos.find((todo) => todo.id === id);

  editInput.value = todoToEdit.text;
  editModal.classList.remove("hidden");
}

// Save edited task
saveEditButton.addEventListener("click", () => {
  if (currentEditingTodoId) {
    const updatedText = editInput.value;

    fetch(
      `https://6752728bd1983b9597b6399b.mockapi.io/api/List/${currentEditingTodoId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: updatedText }),
      }
    )
      .then((response) => response.json())
      .then((updatedTodo) => {
        todos = todos.map((todo) =>
          todo.id === currentEditingTodoId ? updatedTodo : todo
        );
        renderTodos();
        closeEditModal();
        currentEditingTodoId = null;
        editInput.value = "";
      });
  }
});

// Close edit modal
closeEditModalButton.addEventListener("click", closeEditModal);

function closeEditModal() {
  editModal.classList.add("hidden");
}

// Delete task
function deleteTodo(id) {
  fetch(`https://6752728bd1983b9597b6399b.mockapi.io/api/List/${id}`, {
    method: "DELETE",
  }).then(() => {
    todos = todos.filter((todo) => todo.id !== id);
    renderTodos();
  });
}

// Delete selected tasks
deleteSelectedButton.addEventListener("click", () => {
  const selectedIds = Array.from(
    todoList.querySelectorAll("input[type=checkbox]:checked")
  ).map((checkbox) => checkbox.value);

  Promise.all(
    selectedIds.map((id) =>
      fetch(`https://6752728bd1983b9597b6399b.mockapi.io/api/List/${id}`, {
        method: "DELETE",
      })
    )
  ).then(() => {
    todos = todos.filter((todo) => !selectedIds.includes(todo.id.toString()));
    renderTodos();
    selectAllCheckbox.checked = false;
  });
});

// Select all functionality
selectAllCheckbox.addEventListener("change", (e) => {
  const checkboxes = todoList.querySelectorAll("input[type=checkbox]");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = e.target.checked;
  });
});

// Update the state of the "Select All" checkbox based on individual checkboxes
function updateSelectAllCheckbox() {
  const checkboxes = todoList.querySelectorAll("input[type=checkbox]");

  selectAllCheckbox.checked = Array.from(checkboxes).every(
    (checkbox) => checkbox.checked
  );
}
