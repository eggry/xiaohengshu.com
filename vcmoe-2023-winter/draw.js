const SERVER_URL = "https://vc-moe-202301.azurewebsites.net"

var $table = $('#table')
var $favList = $('#fav_list')
var $seed = $('#seed')
var $pageSize = $('#page-size')
var $result = $('#result')
var $drawSettings = $('#draw-settings')
var $drawBtn = $('#draw-btn')
var $drawBtnDiv = $('#draw-btn-div')
var $resultTextDiv = $('#result-text-div')
var $resultTableDiv = $('#result-table-div')
var $addFav = $('#add-fav')
var $addFavTextDiv = $('#add-fav-text-div')

function toBiliLink(avid) {
    return `https://www.bilibili.com/video/av${avid}/`
}

function idFormatter(value, row, index) {
    var avid = row.id
    var bililink = toBiliLink(avid)
    return `<a class="link" target="_blank" href="${bililink}">${avid}</a>`
}

function ctimeFormatter(value, row, index) {
    var t = new Date(row.ctime * 1000);
    var year = t.getFullYear()
    var month = t.getMonth() + 1
    var date = t.getDate()
    year = String(year).padStart(4, "0")
    month = String(month).padStart(2, "0")
    date = String(date).padStart(2, "0")
    return year + "-" + month + "-" + date
}
function add_fav_script(title, list) {
    return `var fav_title = ${JSON.stringify(title)}
var aid_list = ${JSON.stringify(list.map(function (item) { return item.id; }))}
var cookie = document.cookie
var csrf = cookie.replace(/(?:(?:^|.*;\\s*)bili_jct\\s*\\=\\s*([^;]*).*$)|^.*$/, "$1");
const CREATE_FAV = "https://api.bilibili.com/x/v3/fav/folder/add"
const ADD_FAV = "https://api.bilibili.com/x/v3/fav/resource/deal"
function add_fav(avid, fav_id) {
    $.ajax({
        type: 'POST',
        url: ADD_FAV,
        data: { rid: avid, type: 2, add_media_ids: fav_id, csrf: csrf },
        async: false,
        xhrFields: { withCredentials: true },
        dataType: "json",
    }).success(
        (result) => {
            console.log("https://www.bilibili.com/video/av"+avid, " 收藏成功")
        }
    )
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function create_fav(fav_title) {
    $.ajax({
        type: 'POST',
        url: CREATE_FAV,
        data: { title: fav_title, csrf: csrf },
        async: false,
        xhrFields: { withCredentials: true },
        dataType: "json",
    }).success(
        (result) => {
            fav_id = result.data.id
            console.log("收藏夹id:", fav_id)
        }
    )
}

if (csrf) {
    create_fav(fav_title, aid_list)
    for (i = 0; i < aid_list.length; i++) {
        aid = aid_list[i]
        add_fav(aid, fav_id);
        await sleep(500)
    }
    console.log("执行结束！")
    console.log('收藏夹： ','https://space.bilibili.com/495775367/favlist?fid='+fav_id)
} else {
    console.log("csrf错误")
}`
}
function genResult(data) {
    var pageData = $table.bootstrapTable('getData', { useCurrentPage: true })
    if (pageData.length&& pageData.length>0 && pageData.length<=11) {
        var group_id = pageData[0]._group_id
        var text = `【预选赛-${group_id}组】${pageData.length}进4\n`
        pageData.forEach((item, index) => {
            text += `${(index + 1)} ${toBiliLink(item.id)}\n`
        });
        text += "每人最多投4票，格式：1 2 3 4"
        $result.val(text)
        $addFav.val(add_fav_script(`预选赛-${group_id}组`,pageData))
    }else{
        $result.val("请选择组号")
    }
}

function loadFavData(result) {
    $favList.html("")
    $.each(result, function (i, field) {
        $favList.append($('<option>', {
            value: field.id,
            text: `${field.title} (${field.media_count})`
        }));
    });
    $drawSettings.attr("disabled", false)
}

function loadDrawResult() {

    $drawSettings.attr("disabled", true)
    $drawBtnDiv.hide()
    $resultTextDiv.show()
    $resultTableDiv.show()
    $addFavTextDiv.show()

    var url = `${SERVER_URL}/group/1?perfer_size=10`

    $table.bootstrapTable('refreshOptions', {
        url: url,
    })
}

function tableLoadError(status, jqXHR) {
    alert(`获取抽签结果错误！请刷新页面重试 :(\njqXHR: ${JSON.stringify(jqXHR)}\nstatus: ${JSON.stringify(status)}`);
}

$(function () {
    $table.bootstrapTable({
        onPostBody: genResult,
        onLoadError: tableLoadError
    })
    loadDrawResult()
})