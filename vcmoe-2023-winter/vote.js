const SERVER_URL = "https://vc-moe-202301.azurewebsites.net"

var $electionList = $('#election_list')
var $result = $('#result')
var $vote = $('#vote')
var $vote_rp = $('#vote_rp')

function toBiliLink(avid) {
    return `https://www.bilibili.com/video/av${avid}/`
}

function avidFormatter(value, row, index) {
    var avid = row.avid
    var bililink = toBiliLink(avid)
    return `<a class="link" target="_blank" href="${bililink}">${avid}</a>`
}

function ctimeFormatter(value, row, index) {
    var t = new Date(row.ctime * 1000);
    var month = t.getMonth() + 1
    var date = t.getDate()
    var hours = t.getHours()
    var minute = t.getMinutes()
    month = String(month).padStart(2, "0")
    date = String(date).padStart(2, "0")
    hours = String(hours).padStart(2, "0")
    minute = String(minute).padStart(2, "0")
    return month + "-" + date + " " + hours + ":" + minute
}

function loadElections(result) {
    $electionList.html("")
    $.each(result, function (i, field) {
        $electionList.append($('<option>', {
            value: field.rpid,
            text: `${field.title}`
        }));
    });
    $electionList.attr("disabled", false)
    $electionList.change()
}

function loadDrawResult() {
    rpid = $electionList.val()
    $vote_rp.attr("href", `https://www.bilibili.com/video/BV1G7411k7cx/#reply${rpid}`);
    var url = `${SERVER_URL}/elections/${rpid}/votes`
    $vote.bootstrapTable('refreshOptions', {
        url: url,
    })

    var url = `${SERVER_URL}/elections/${rpid}/result`
    $result.bootstrapTable('refreshOptions', {
        url: url,
    })
}
const voteModal = document.getElementById('voteModal')
voteModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget

    const action = button.getAttribute('data-bs-action')

    const modalBodyTextArea = voteModal.querySelector('.modal-body textarea')
    var vote_name = $("#election_list :selected").text()

    selections = $result.bootstrapTable('getSelections')
    if (action === "final") {
        l = vote_name.indexOf("-")
        r = vote_name.indexOf("???")
        vote_name = vote_name.slice(l + 1, r)
        if (selections?.length) {
            modalBodyTextArea.value = `${vote_name}??????\n`
            selections.forEach(element => {
                modalBodyTextArea.value += `${toBiliLink(element.avid)} ${element.votes}???\n`
            });
        } else {
            modalBodyTextArea.value = `${vote_name}??????\n???`
        }
    } else if (action === "extra") {
        l = vote_name.indexOf("???")
        r = vote_name.indexOf("???")
        vote_name = vote_name.slice(l + 1, r)
        if (vote_name.endsWith("?????????")) {
            vote_name = `???${vote_name}???????????????`
        } else {
            vote_name = `???${vote_name}????????????`
        }
        if (selections?.length) {
            modalBodyTextArea.value = `${vote_name}${selections.length}???X\n`
            selections.forEach((element, index) => {
                modalBodyTextArea.value += `${index + 1} ${toBiliLink(element.avid)}\n`
            });
            modalBodyTextArea.value += "???????????????X???\n????????????????????????14:00"
        } else {
            modalBodyTextArea.value = `?????????????????????????????????`
        }
    }
})
function tableLoadError(status, jqXHR) {
    alert(`???????????????????????????????????????????????? :(\njqXHR: ${JSON.stringify(jqXHR)}\nstatus: ${JSON.stringify(status)}`);
}

$(function () {
    $electionList.change(loadDrawResult)
    $vote.bootstrapTable({
        onLoadError: tableLoadError
    })
    $result.bootstrapTable({
        onLoadError: tableLoadError
    })

    const url = `${SERVER_URL}/elections`;
    $.ajax(url)
        .done(loadElections)
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert(`???????????????????????????????????????????????? :(\njqXHR: ${JSON.stringify(jqXHR)}\ntextStatus: ${JSON.stringify(textStatus)}\nerrorThrown: ${JSON.stringify(errorThrown)}`);
        })
})