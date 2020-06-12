$(document).ready(() => {
  tinymce.init({
    selector: ".tinymce",
    branding: false,
    skin: "nentora",
    br_in_pre: false,
    plugins: [
      "advlist link autolink image lists charmap preview hr",
      "searchreplace wordcount code insertdatetime media",
      "save table directionality paste mention noneditable",
    ],
    height: "350",
    default_link_target: "_blank",
    mentions: {
      delay: 100,
      items: 8,
      source: function (query, process, delimiter) {
        if (delimiter === "@") {
          $.ajax({
            url: location.origin + "/get-users",
            method: "POST",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              query,
            }),
            success: function (data) {
              process(data.body.results);
            },
          });
        }
      },
      highlighter: function (text) {
        //make matched block italic
        return text.replace(new RegExp("(" + this.query + ")", "ig"), function (
          $1,
          match
        ) {
          return match;
        });
      },
      insert: function (item, process) {
        return `
          <span class="mention text-body mceNonEditable">
            <em class="fas fa-reply">&nbsp;</em>
            <span>${item.name}</span>
          </span>
        `;
      },
      render: function (item) {
        return (
          `<li class="dropdown-item">` +
          '<a href="#" class="dropdown-link text-white font-weight-bold">' +
          item.name +
          "</a>" +
          "</li>"
        );
      },
      renderDropdown: function () {
        return '<ul class="rte-autocomplete dropdown-menu bg-secondary"></ul>';
      },
    },
    setup: function (editor, event) {
      editor.on("change", function () {
        tinymce.triggerSave();
      });
    },
  });

  $(document).on("focusin", function (e) {
    if ($(e.target).closest(".tox-textfield").length)
      e.stopImmediatePropagation();
  });
});
