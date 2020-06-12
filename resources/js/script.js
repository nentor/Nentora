$(document).ready(function () {
  const socket = io(location.origin);

  $(function () {
    socket.on("connect", () => {
      console.log("successfully connected");
    });

    // socket.on("notification", (notification) => {
    //   console.log(notification);
    // });
  });

  // let incrementor = 0;

  // setInterval(function () {
  //   $(".notifications").html(`
  //     <span
  //       class="badge notification-badge badge-dark">${++incrementor}</span>
  //     </span>
  //   `);
  // }, 1000);

  // Load Tinymce in every page where it's used (except the index page)
  if ($(document).find(".tinymce").not(".modal-textarea")[0]) {
    loadTinyMCE();
  }

  // Load Tinymce when the post thread button is clicked
  $('.btn[data-target="#postThreadModal"]').click(function () {
    loadTinyMCE();
    // $("body").on("shown.bs.modal", () => {
    //   console.log($("body").hasClass("modal-open"));
    // });
  });

  $(function () {
    $.ajax({
      url: location.origin + "/get-categories",
      method: "GET",
      type: "GET",
      success: function (data) {
        const { categories } = data.results;

        $.each(categories, (index, category) => {
          $(".categories-select option:last-child").after(`
          <option value="${category.name}">
            ${category.name}
          </option>
        `);
        });
      },
      complete: function () {
        if (localStorage.getItem("category")) {
          $(".categories-select").val(localStorage.getItem("category"));
        } else {
          $(".categories-select").val("All");
        }
      },
    });
  });

  $(function () {
    const limit = 5;
    let currentOffset = 0;

    $.ajax({
      url:
        location.origin +
        "/get-notifications" +
        `?limit=${limit}` +
        `&offset=${currentOffset}`,
      method: "GET",
      type: "GET",
      contentType: "application/json",
      success: function (data) {
        const { notifications, count } = data.result;
        const maxOffset = Math.ceil(count / limit);
        let scrollBelowButton = ``;

        $.each(notifications, function (index, notification) {
          const user = notification.user;
          const post = notification.thread;

          pushNotification(notification, user, post, "append");

          if (index === limit - 1) {
            scrollBelowButton = `
              <a>
                <i class="more-notifications-icon fas fa-chevron-down"></i>
              </a>
            `;
            currentOffset = index + 1;
            return false;
          }
        });

        $(".toasts").append(scrollBelowButton);

        const toasts = document.querySelectorAll(".toast");

        const observer = new IntersectionObserver(
          function (entries, observer) {
            $("#notificationsModal").on("shown.bs.modal", function () {
              console.log(entries);
              entries.forEach((entry, index) => {
                if (index % limit === 0) {
                  $.ajax({
                    url:
                      location.origin +
                      "/get-notifications" +
                      `?offset=${currentOffset}` +
                      `&limit=${limit}`,
                    method: "GET",
                    type: "GET",
                    contentType: "application/json",
                    async: false,
                    success: function (data) {
                      const { notifications } = data.result;

                      // if (currentOffset >= maxOffset) return;

                      $.each(notifications, function (index, notification) {
                        const user = notification.user;
                        const post = notification.thread;

                        pushNotification(notification, user, post, "append");

                        if ((index + 1) % limit === 0) {
                          currentOffset += index + 1;
                          return false;
                        }
                      });
                    },
                  });
                }
              });
            });
          },
          {
            root: document.querySelector("#notificationsModal"),
            threshold: 0,
            rootMargin: "-500px",
          }
        );

        toasts.forEach((toast) => observer.observe(toast));
        $(".toasts").on("DOMNodeInserted", "div", function (toast) {
          observer.observe(toast.target);
        });
      },
    });

    socket.on("notification", ({ notification, user, thread }) => {
      pushNotification(notification, user, thread, "prepend");
    });

    // $(".notifications").html(`
    //   <span
    //     class="badge notification-badge badge-dark">${count}</span>
    //   </span>
    // `);
  });

  $('[data-toggle="tooltip"]').tooltip();

  $(".btn-thread-submit").click(function () {
    $(".post-thread-modal-form").submit();
  });

  $(".btn-logout").click(function () {
    $(".logout-modal-form").submit();
  });

  $(".mention, .recipient").on("mouseenter", function (e) {
    const self = this;
    let username;

    console.log(self);

    if ($(self).hasClass("recipient")) {
      username = $(self).children(".name").text().trim();
    } else {
      username = $(self).text().trim();
    }

    $.ajax({
      url: location.origin + "/get-users",
      type: "POST",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        query: username,
      }),
      success: function (data) {
        const { name, avatar, description } = data.body.results[0];

        const cardPopUp = `
        <div class="card card-popup" style="width: 18rem; position: absolute; top: -30px; left: -10px; font-family: Lato;">
          <div class="card-body p-3 px-3">
              <img class="mr-1 rounded-circle" src="/images/avatars/${avatar}" alt="User Avatar" width="50" height="50">
              <div class="d-inline-flex flex-column">
                <span class="username font-weight-bolder mb-1" style="font-size: 16px;">${name}</span>
                <small>${description}</small>
              </div>
          </div>
        </div>
        `;

        $(self).css("position", "relative");

        $(cardPopUp).hide().prependTo($(self).children().first()).fadeIn(600);

        $(".card-popup").on("mouseleave", function () {
          $(".card-popup").fadeOut(300, function () {
            $(".card-popup").remove();
          });
        });

        $(".card-popup").on("click", function () {
          location.href = location.origin + `/profile/${name}`;
        });
      },
    });
  });

  // Closes any alert after being shown for 2 seconds
  // or doesn't show it at all if the user has visited the page recently (ie the page is cached)
  const isCached =
    performance.getEntriesByType("navigation")[0].transferSize === 0;

  if (isCached) {
    $(".alert").remove();
  } else {
    setTimeout(function () {
      $(".alert").alert("close");
    }, 2000);
  }

  $(".categories-select").on("change", function (e) {
    localStorage.setItem("category", e.target.value);
  });

  $(".categories-select-home").on({
    change: function (e) {
      $.ajax({
        url: location.origin + "/change-category",
        method: "POST",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          category: e.target.value,
        }),
        success: function () {
          location.reload();
        },
      });
    },
  });

  $(function () {
    if (localStorage.getItem("order")) {
      $(".order-select").val(localStorage.getItem("order"));
    } else {
      $(".order-select").val("Descending");
    }
  });

  $(".order-select").on({
    change: function (e) {
      localStorage.setItem("order", e.target.value);

      $.ajax({
        url: location.origin + "/change-order",
        type: "POST",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          order: e.target.value,
        }),
        success: function () {
          location.reload();
        },
      });
    },
  });

  // Trigger a hidden input of type file when clicked
  $(".user-avatar-img").on("click", function () {
    $(".user-avatar-upload").click();
  });

  $(".user-avatar-upload").change(function () {
    $(".user-avatar-upload").parent().submit(); // submit the form
  });

  // Add slideDown animation to Bootstrap dropdown when expanding.
  $(".dropdown").on("show.bs.dropdown", function () {
    $(this).find(".dropdown-menu").first().stop(true, true).slideDown();
  });

  // Add slideUp animation to Bootstrap dropdown when collapsing.
  $(".dropdown").on("hide.bs.dropdown", function () {
    $(this).find(".dropdown-menu").first().stop(true, true).slideUp();
  });

  // Prevent the dropdown from closing when clicked inside (ie when a notification toast is closed)
  $(".dropdown-menu").on("click", function (e) {
    e.stopPropagation();
  });

  $("button.thread-mention-button").on("click", function () {
    const username = $(this).data("username");

    changeTinyMCEContent(
      `
      <span class="mention text-body mceNonEditable">
        <em class="fas fa-reply">&nbsp;</em>
        <span>${username}</span>
      </span>
    `,
      "answerBody"
    );
  });

  $("button.thread-edit-button").on("click", function (e) {
    if ($(e.target).hasClass("btn")) {
      e.stopPropagation();
    }

    const answerId = $(e.target).closest(".card").data("ans");
    const body = $(`.card[data-ans=${answerId}]`).find(".card-text").html();

    $("#editAnswerModal").on("show.bs.modal", function (e2) {
      changeTinyMCEContent(body, "editAnswerBody");
    });

    $("#editAnswerModal").on("submit", function (e) {
      e.preventDefault();
      const editor = tinyMCE.get("editAnswerBody");
      const data = editor.getContent();

      const url = $(e.target).attr("action");

      $.ajax({
        url,
        method: "POST",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          body: data,
          id: answerId,
        }),
        success: function (data) {
          $(`.card[data-ans=${answerId}]`).find(".card-text").html(data.body);
          $("#editAnswerModal").modal("hide");
        },
      });
    });
  });
});

function intervalManager(flag, time, interval) {
  if (flag) {
    return setInterval(interval, time);
  } else {
    clearInterval(interval);
  }
}

// Tinymce.min.js
function loadTinyMCE() {
  let tinymce = document.createElement("script");
  tinymce.src = "/js/tinymce/tinymce.min.js";
  let ref = document.querySelector(
    `script[src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"]`
  );
  tinymce.onload = function () {
    initializeTinyMCE();
  };
  ref.parentNode.insertBefore(tinymce, ref);
}

// Init-tinymce.js
function initializeTinyMCE() {
  let tinymce = document.createElement("script");
  tinymce.src = "/js/tinymce/init-tinymce.js";
  let ref = document.querySelector(
    `script[src="https://code.jquery.com/jquery-3.4.1.min.js"]`
  );
  ref.parentNode.insertBefore(tinymce, ref);
}

function changeTinyMCEContent(newContent, instance) {
  var editor = tinymce.get(instance);
  var content = editor.getContent();
  content = content.replace(/.*/, newContent);
  editor.setContent(content);
}

function pushNotification(notification, user, post, prependOrAppend) {
  const dateArr = post.createdAt.split("/");

  const day = dateArr[0];
  const month = dateArr[1];
  const year = dateArr[2].split(" ")[0];
  const hours = dateArr[2].split(" ")[1].split(":")[0];
  const minutes = dateArr[2].split(" ")[1].split(":")[1];
  const seconds = dateArr[2].split(" ")[1].split(":")[2];

  const dateFormatted = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  const dateFormattedISO = new Date(dateFormatted).toISOString();

  notification = `
  <div class="toast"
    role="alert"
    aria-live="assertive"
    aria-atomic="true">
      <div class="toast-header justify-content-between">
        <div class="d-flex align-items-center">
          <img src="images/avatars/${user.avatar}"
            width="45"
            height="45"
            class="mr-2 mt-1 rounded-circle"
            alt="...">
          <div class="d-flex flex-column">
            <strong class="my-0 h6 font-weight-bold">${user.username}</strong>
            <time class="small timeago" datetime="${dateFormattedISO}">${$.timeago(
    dateFormatted
  )}</time>
          </div>
        </div>
        <button type="button"
          class="ml-auto mb-1 close"
          data-dismiss="toast"
          aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="toast-body">
        <div class="font-weight-bold">Posted a new ${
          notification.type
        } <a href="#"
          class="ml-1 text-info h6 font-weight-bold">${post.title}</a>
        </div>
      </div>
    </div>
  `;

  const clearButtonHtml = `<button class="btn btn-sm btn-danger mb-3">Clear All</button>`;
  const clearButtonParent = $(".clear-button-wrapper");
  const clearButtonsPresent = $(clearButtonParent).children($(clearButtonHtml))
    .length;

  if (!clearButtonsPresent) {
    $(clearButtonParent).append(clearButtonHtml);
  }

  $("[data-no-notifications]").remove();

  if (prependOrAppend === "append") {
    $(".toasts").append(notification);
  } else {
    $(".toasts").prepend(notification);
  }

  $(".toast").toast({ autohide: false });
  $(".toast").toast("show");
}

// function displayNotifications(url, limit, refs) {
//   let notificationsResult = ``;

//   $.ajax({
//     url,
//     method: "GET",
//     type: "GET",
//     contentType: "application/json",
//     success: function (data) {
//       const { notifications, count } = data.result;
//       const maxOffset = Math.ceil(count / limit);

//       $.each(notifications, function (index, notification) {
//         const user = notification.user;
//         const post = notification.thread;

//         pushNotification(notification, user, post);

//         if (index === limit - 1) {
//           notificationsResult += `
//             <a>
//               <i class="more-notifications-icon fas fa-chevron-down"></i>
//             </a>
//           `;
//           refs.currentOffset++;
//           return false;
//         }
//       });

//       $(".toasts").append(notificationsResult);
//     },
//   });
// }
