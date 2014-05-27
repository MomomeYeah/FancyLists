$(document).ready(function() {
    $("#category_id").change(function() {
        $("#addCategoryForm").submit();
    })

    $(".removeCategoryForm a").click(function() {
        $(this).parents(".removeCategoryForm").submit();
    })
})