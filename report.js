/**
 * report.js
 * @author Vivian
 * @version 1.0.0
 * copyRight 2014-2015, gandxiaowei@gmail.com all rights reserved.
 */
var child_process = require("child_process"),
    fs = require('fs'),
    util = require('util'),
    path = require('path'),
    moment = require('moment'),
    xml2js = require('xml2js');

var reportPath = '工作周报';
var fileFormat = '%s工作周报(%s-%s).txt';


function reportWeeklyWork(userName, options) {
    if (!options) {
        options = {};
    }

    if (!fs.existsSync(reportPath)) {
        fs.mkdirSync(reportPath);
    }

    var startDate = options.startDate,
        endDate = options.endDate;
    if (!startDate || !endDate) {
        var current = moment().week();
        startDate = moment().week(current - 1).format('YYYY-MM-DD');
        endDate = moment().week(current - 1).add(6, 'days').format('YYYY-MM-DD');
    } else {
        startDate = moment(startDate).format('YYYY-MM-DD');
        endDate = moment(endDate).format('YYYY-MM-DD');
    }
    var cmd = util.format('svn log --search %s --xml svn://192.168.1.92/svn/mncg_game/trunk/wap -r {%s}:{%s}',
        userName, startDate, endDate
    );
    console.log('@cmd:' + cmd);
    child_process.exec(cmd, {encoding: 'utf8'}, function (err, data) {
        xml2js.parseString(data, function (error, result) {
            var report = buildReport(result.log.logentry);
            var filePath = path.join(reportPath, util.format(fileFormat, userName, moment(startDate).format('M.DD'), moment(endDate).format('M.DD')));
            fs.writeFileSync(filePath, report);
        });
    });
}

function buildReport(logentrys) {
    var logentry;
    var tempDate;
    var tempMsgs;
    var report = '';
    var msgIndex = 0;
    for (var i = 0; i < logentrys.length; i++) {
        logentry = logentrys[i];
        var logDate = moment(logentry.date[0]).format('YYYY-MM-DD');
        if (!tempDate || logDate != tempDate) {
            tempDate = logDate;
            tempMsgs = [];
            msgIndex = 0;
            report += (tempDate + '\r\n');
        }
        var msgs = logentry.msg[0].split('\n');
        for (var j = 0; j < msgs.length; j++) {
            var msg = msgs[j];
            if (msg.trim() == '' || tempMsgs.indexOf(msg) >= 0) {
                continue;
            }
            tempMsgs.push(msg);
            msgIndex++;
            report += ('\t' + msgIndex + '.' + msg.replace(/\d+\./, '') + '\r\n');
        }

    }
    return report;
}

reportWeeklyWork('gexiaowei', {
    startDate: '2015-05-17',
    endDate: '2015-05-24'
});

reportWeeklyWork('zhangtong', {
    startDate: '2015-05-17',
    endDate: '2015-05-24'
});

module.exports = reportWeeklyWork;