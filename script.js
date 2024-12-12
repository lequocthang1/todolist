const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const deleteSelectedButton = document.getElementById("delete-selected");
const selectAllCheckbox = document.getElementById("select-all");
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const saveEditButton = document.getElementById("save-edit-button");
const closeEditModalButton = document.getElementById("close-edit-modal");
const loadingOverlay = document.getElementById("loading");

function showLoading() {
  loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  loadingOverlay.classList.add("hidden");
}

let todos = [];
let currentEditingTodoId = null;

// Fetch existing tasks from MockAPI
showLoading();
fetch("https://6752728bd1983b9597b6399b.mockapi.io/api/List")
  .then((response) => response.json())
  .then((data) => {
    todos = data;
    renderTodos();
  })
  .catch((error) => console.error("Error fetching todos:", error))
  .finally(() => hideLoading()); // Ẩn loading khi kết thúc

// Add new task
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newTodo = { text: input.value };

  showLoading();

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
    })
    .catch((error) => console.error("Error adding todo:", error))
    .finally(() => hideLoading()); // Ẩn loading
});

// Render tasks
// Render tasks
function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center mb-4 p-3";

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

    // Nút trạng thái
    const statusButton = document.createElement("button");

    // Thiết lập nội dung và màu sắc cho nút trạng thái dựa trên giá trị hiện tại
    statusButton.textContent = todo.status || "Trạng thái"; // Nếu không có trạng thái, hiển thị "Trạng thái"

    switch (todo.status) {
      case "Hoàn thành":
        statusButton.className = "w-32 p-1 bg-green-500 text-white rounded"; // Màu xanh cho hoàn thành
        break;
      case "Đang làm":
        statusButton.className = "w-32 p-1 bg-blue-400 text-white rounded"; // Màu vàng cho đang làm
        break;
      case "Hoãn":
        statusButton.className = "w-32 p-1 bg-purple-900 text-white rounded"; // Màu đỏ cho hoãn
        break;
      default:
        statusButton.className = "w-32 p-1 bg-gray-300 text-black rounded"; // Mặc định
    }

    // Tạo dropdown
    const options = ["Hoàn thành", "Đang làm", "Hoãn"];
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className =
      "hidden absolute bg-white shadow-lg rounded-lg mt-1";

    options.forEach((option) => {
      const listItem = document.createElement("li");
      listItem.textContent = option;
      listItem.className = "p-2 hover:bg-gray-200 cursor-pointer";

      // Gán sự kiện click để thay đổi nội dung nút và cập nhật màu sắc
      listItem.addEventListener("click", () => {
        statusButton.textContent = option; // Thay đổi nội dung của nút trạng thái

        // Thay đổi màu sắc của nút dựa trên tùy chọn đã chọn
        switch (option) {
          case "Hoàn thành":
            statusButton.className = "w-32 p-1 bg-green-500 text-white rounded";
            break;
          case "Đang làm":
            statusButton.className = "w-32 p-1 bg-blue-400 text-white rounded";
            break;
          case "Hoãn":
            statusButton.className =
              "w-32 p-1 bg-purple-900 text-white rounded";
            break;
          default:
            statusButton.className = "w-32 p-1 bg-gray-300 text-black rounded";
        }

        // Cập nhật trạng thái lên API
        showLoading();
        fetch(
          `https://6752728bd1983b9597b6399b.mockapi.io/api/List/${todo.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...todo, status: option }), // Gửi trạng thái mới
          }
        )
          .then((response) => response.json())
          .then((updatedTodo) => {
            todos = todos.map((t) =>
              t.id === updatedTodo.id ? updatedTodo : t
            );
            renderTodos(); // Render lại danh sách sau khi cập nhật
          })
          .catch((error) => console.error("Error updating status:", error))
          .finally(() => hideLoading()); // Ẩn loading
        dropdownMenu.classList.add("hidden"); // Ẩn dropdown sau khi chọn
      });

      dropdownMenu.appendChild(listItem);
    });

    statusButton.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden"); // Chuyển đổi giữa hiển thị và ẩn
    });

    buttonContainer.appendChild(statusButton); // Thêm nút trạng thái vào buttonContainer
    buttonContainer.appendChild(dropdownMenu); // Thêm dropdown vào buttonContainer

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className =
      "p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 w-16";

    editButton.onclick = () => openEditModal(todo.id);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className =
      "p-1 bg-red-500 text-white rounded hover:bg-red-600 w-20";

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

  editInput.value = todoToEdit.text; // Set current task text in input
  editModal.classList.remove("hidden"); // Show modal
}

// Save edited task
saveEditButton.addEventListener("click", () => {
  if (currentEditingTodoId) {
    const updatedText = editInput.value;
    showLoading();
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
        closeEditModal(); // Close modal after saving
        currentEditingTodoId = null; // Reset editing ID
        editInput.value = ""; // Clear input field
      })
      .catch((error) => console.error("Error updating status:", error))
      .finally(() => hideLoading()); // Ẩn loading
  }
});

// Close edit modal
closeEditModalButton.addEventListener("click", closeEditModal);

function closeEditModal() {
  editModal.classList.add("hidden"); // Hide modal
}

// Delete task
function deleteTodo(id) {
  showLoading();
  fetch(`https://6752728bd1983b9597b6399b.mockapi.io/api/List/${id}`, {
    method: "DELETE",
  })
    .then(() => {
      todos = todos.filter((todo) => todo.id !== id);
      renderTodos();
    })
    .catch((error) => console.error("Error deleting todo:", error))
    .finally(() => hideLoading()); // Ẩn loading
}

// Delete selected tasks
deleteSelectedButton.addEventListener("click", () => {
  const selectedIds = Array.from(
    todoList.querySelectorAll("input[type=checkbox]:checked")
  ).map((checkbox) => checkbox.value);
  showLoading();
  Promise.all(
    selectedIds.map((id) =>
      fetch(`https://6752728bd1983b9597b6399b.mockapi.io/api/List/${id}`, {
        method: "DELETE",
      })
    )
  )
    .then(() => {
      todos = todos.filter((todo) => !selectedIds.includes(todo.id.toString()));
      renderTodos();
      selectAllCheckbox.checked = false; // Uncheck "Select All" after deletion
    })
    .catch((error) => console.error("Error deleting todo:", error))
    .finally(() => hideLoading()); // Ẩn loading
});

// Select all functionality
selectAllCheckbox.addEventListener("change", (e) => {
  const checkboxes = todoList.querySelectorAll("input[type=checkbox]");

  checkboxes
    .forEach((checkbox) => {
      checkbox.checked = e.target.checked;
    })
    .catch((error) => console.error("Error deleting todo:", error))
    .finally(() => hideLoading()); // Ẩn loading
});

// Update the state of the "Select All" checkbox based on individual checkboxes
function updateSelectAllCheckbox() {
  const checkboxes = todoList.querySelectorAll("input[type=checkbox]");

  selectAllCheckbox.checked = Array.from(checkboxes).every(
    (checkbox) => checkbox.checked
  );
}
