$(document).ready(function() {
    $(".fancylist").on("change", "#category_id", function() {
        var fancylist = $(this).parents("div.fancylist").find("input[name='fancylist_id']").val();
        var data_in = {
          category_id : $("#category_id").val()
        };
        ajaxutil.post('/lists/addCategory/' + fancylist
          , data_in
          , null
          , $('.categoryContainer')
          );

        $(this).val("");
    });

    $(".fancylist").on("click", ".removeCategory a", function() {
        var fancylistcategory = $(this).parents("div.category").find("input[name='fancylistcategory_id']").val();
        ajaxutil.post('/lists/removeCategory/' + fancylistcategory
          , null
          , null
          , $(this).parents("div.category")
          );
    });

    $(".fancylist").on("change", ".item_id", function() {
        var fancylistcategory = $(this).parents("div.category").find("input[name='fancylistcategory_id']").val();
        var data_in = {
          item_id : $(this).val()
        };
        ajaxutil.post('/lists/addItem/' + fancylistcategory
          , data_in
          , null
          , $(this).parents("div.categoryContents").find("div.itemContainer")
          );

        $(this).val("");
    });

    $(".fancylist").on("click", ".removeItem a", function() {
        var fancylistcategoryitem = $(this).parents("div.item").find("input[name='fancylistcategoryitem_id']").val();
        ajaxutil.post('/lists/removeItem/' + fancylistcategoryitem
          , null
          , null
          , $(this).parents("div.item")
          );
    });

    $(".fancylist").on("click", ".showHideCategory", function() {
        categoryContents = $(this).parents("div.category").find("div.categoryContents").toggle();
        $(this).find(".showCategory").toggle();
        $(this).find(".hideCategory").toggle();
    });

    $(".itemContainer").sortable({
      axis: "y",
      scroll: true,
      placeholder: "sortable-item-placeholder",
      forcePlaceholderSize: true,
      cursor: "move",
      revert: false,
      stop: function(event, ui) {
        var fancylistcategoryitem = ui.item.find("input[name='fancylistcategoryitem_id']").val();
        var data_in = {
          item_position : ui.item.index()
        };
        ajaxutil.post('/lists/reorderItem/' + fancylistcategoryitem
          , data_in
          , null
          , null
          );
      }
    });

    $(".categoryContainer").sortable({
      axis: "y",
      scroll: true,
      placeholder: "sortable-category-placeholder",
      forcePlaceholderSize: true,
      cursor: "move",
      revert: false,
      handle: ".categoryHandle",
      stop: function(event, ui) {
        var fancylistcategory = ui.item.find("input[name='fancylistcategory_id']").val();
        var data_in = {
          category_position : ui.item.index()
        };
        ajaxutil.post('/lists/reorderCategory/' + fancylistcategory
          , data_in
          , null
          , null
          );
      }
    });
});
