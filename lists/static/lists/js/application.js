$(document).ready(function() {
    $("#category_id").change(function() {
        $("#addCategoryForm").submit();
    })

    $(".removeCategoryForm a").click(function() {
        $(this).parents(".removeCategoryForm").submit();
    })

    $(".item_id").change(function() {
        $(this).parents(".addItemForm").submit();
    })

    $(".removeItemForm a").click(function() {
        $(this).parents(".removeItemForm").submit();
    })
})