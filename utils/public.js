export default {
    //时间封装
    dateFormat: {
        //日期格式化
        /**
         *
         * @param date 标准时间日期格式
         * @param fmt 格式化格式
         * @returns {string}
         */
        format(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
            date = new Date(date).getTime();
            date = new Date(date);
            var o = {
                'M+': date.getMonth() + 1,
                'D+': date.getDate(),
                'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
                'H+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds(),
                'q+': Math.floor((date.getMonth() + 3) / 3),
                'S': date.getMilliseconds()
            }
            var week = {
                '0': '\u65e5',
                '1': '\u4e00',
                '2': '\u4e8c',
                '3': '\u4e09',
                '4': '\u56db',
                '5': '\u4e94',
                '6': '\u516d'
            }
            if (/(Y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
            }
            if (/(E+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468') : '') + week[date.getDay() + ''])
            }
            for (var k in o) {
                if (new RegExp('(' + k + ')').test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
                }
            }
            return fmt
        },
        //格式日期兼容苹果端日期获取
        dateReplace(date) {
            return date.replace(/-/g, '/');
        },
        //首页列表格式化时间
        getDateDiff(time, bool = false) {
            var dateTimeStamp = Date.parse(time.replace(/-/g, '/'))
            var minute = 1000 * 60;
            var hour = minute * 60;
            var day = hour * 24;
            var halfamonth = day * 15;
            var month = day * 30;
            var year = month * 12;
            var now = new Date().getTime();
            var diffValue = now - dateTimeStamp;
            var yearC = diffValue / year;
            var dayC = diffValue / day;
            var hourC = diffValue / hour;
            var minC = diffValue / minute;
            var result = ''
            if (diffValue < 0) {
                return getDayName(dateTimeStamp, hourC, minC, time)
            } else {
                // console.log('yearC',yearC,dateTimeStamp,year);
                if (yearC >= 1) {
                    let year=parseInt(yearC)==1?i18n.t('common.time.year'):i18n.t('common.time.years');
                    result = parseInt(yearC) + ' ' + year;
                } else if (dayC >= 1) {
                    let day=parseInt(dayC)==1?i18n.t('common.time.day'):i18n.t('common.time.days');
                    result = parseInt(dayC) + ' ' + day;
                } else if (hourC >= 1) {
                    let hour=parseInt(hourC)==1?i18n.t('common.time.hour'):i18n.t('common.time.hours');
                    result = parseInt(hourC) + ' ' + hour;
                } else if (minC >= 0) {
                    var mini = parseInt(minC)
                    if (parseInt(minC) == 0) {
                        mini = 1
                    }
                    let min=parseInt(hourC)==1?i18n.t('common.time.minute'):i18n.t('common.time.minutes');
                    result = mini + ' ' + min;
                }
                if (!bool) {
                    result = i18n.t('common.time.overdue') + ' ' + result
                }
                return result;
            }
        }
    },
}