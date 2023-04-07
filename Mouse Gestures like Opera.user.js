// ==UserScript==
// @name         Mouse Gestures like Opera
// @namespace    https://greasyfork.org/users/37096/
// @homepage     https://greasyfork.org/scripts/33398/
// @supportURL   https://greasyfork.org/scripts/33398/feedback
// @version      1.0.10
// @description  A Mouse Gestures script is the same as in the old Opera
// @author       Hồng Minh Tâm
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @icon         https://png.icons8.com/mouse-right-click/ultraviolet/40
// @include      *
// @compatible   chrome
// @license      GNU GPLv3
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        window.close
// @grant        window.focus
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle([
        '.mouse-gestures { display: none; z-index: 9999999999; position: fixed; overflow: hidden; border: 1px solid #CCC; white-space: nowrap; font-family: sans-serif; background-color: rgba(0, 0, 0, 0.7); color: #333; border-radius: 50%; width: 400px; height: 400px; }',

        '.mouse-gestures .mouse-gestures-middle, .mouse-gestures .mouse-gestures-up, .mouse-gestures .mouse-gestures-down, .mouse-gestures .mouse-gestures-left, .mouse-gestures .mouse-gestures-right { display: table; position: absolute; height: 160px; width: 160px; padding: 0; margin: 0; }',
        '.mouse-gestures .mouse-gestures-middle { top: 50%; left: 50%; margin-top: -20px; margin-left: -80px; width: 160px; height: 160px; text-align: center; }',
        '.mouse-gestures .mouse-gestures-up { top: 0; left: 50%; margin-left: -80px; }',
        '.mouse-gestures .mouse-gestures-down { bottom: 0; left: 50%; margin-left: -80px; }',
        '.mouse-gestures .mouse-gestures-left { top: 50%; left: 0; margin-top: -80px; }',
        '.mouse-gestures .mouse-gestures-right { top: 50%; right: 0; margin-top: -80px; }',

        '.mouse-gestures .mouse-gestures-label { color: #fff; font-family: Arial,"Helvetica Neue",Helvetica,sans-serif; font-weight: 700; font-size: 16px; text-transform: none; letter-spacing: normal; white-space: pre-wrap; padding: 0; margin: 0; -webkit-transition: all .2s; -moz-transition: all .2s; transition: all .2s; line-height: 22px; }',
        '.mouse-gestures .mouse-gestures-up > .mouse-gestures-label { display: table-cell; vertical-align: bottom; text-align: center; padding-bottom: 50px; }',
        '.mouse-gestures .mouse-gestures-down > .mouse-gestures-label { display: table-cell; vertical-align: top; text-align: center; padding-top: 50px; }',
        '.mouse-gestures .mouse-gestures-left > .mouse-gestures-label { display: table-cell; vertical-align: middle; text-align: right; padding-right: 50px; }',
        '.mouse-gestures .mouse-gestures-right > .mouse-gestures-label { display: table-cell; vertical-align: middle; text-align: left; padding-left: 50px; }',

        '.mouse-gestures .mouse-gestures-icon { position: absolute; width: initial; }',
        '.mouse-gestures .mouse-gestures-middle > .mouse-gestures-icon { position: initial; }',
        '.mouse-gestures .mouse-gestures-up > .mouse-gestures-icon { bottom: 0; left: 50%; margin-left: -20px; }',
        '.mouse-gestures .mouse-gestures-down > .mouse-gestures-icon { top: 0; left: 50%; margin-left: -20px; }',
        '.mouse-gestures .mouse-gestures-left > .mouse-gestures-icon { top: 50%; right: 0; margin-top: -20px; }',
        '.mouse-gestures .mouse-gestures-right > .mouse-gestures-icon { top: 50%; left: 0; margin-top: -20px; }',

        '.mouse-gestures .active > .mouse-gestures-label { color: #ffff00; }',
        '.mouse-gestures .mouse-gestures-up.active > .mouse-gestures-label { padding-bottom: 10px; }',
        '.mouse-gestures .mouse-gestures-down.active > .mouse-gestures-label { padding-top: 10px; }',
        '.mouse-gestures .mouse-gestures-left.active > .mouse-gestures-label { padding-right: 10px; }',
        '.mouse-gestures .mouse-gestures-right.active > .mouse-gestures-label { padding-left: 10px; }',
        '.mouse-gestures .active > .mouse-gestures-icon { display: none; }',

        '.mouse-gestures .hide { display: none; }',
    ].join('\n'));

    var SENSITIVITY = 20;
    var startX;
    var startY;
    var gesture = '';
    var preventContextMenu = false;
    var mouseDownTriggered = false;
    var values = {};
    var types = {};
    var target;
    var defaultFn = {
        close: function () {
            window.top.close();
        },
        newTab: function () {
            defaultFn.openInNewTab();
        },
        duplicateTab: function () {
            defaultFn.openInNewTab(window.location.href);
        },
        openInNewTab: function (link) {
            GM_openInTab(link, false);
        },
        openInNewBackgroundTab: function (link) {
            GM_openInTab(link, true);
        },
        scrollUp: function () {
            $('html, body').animate({
                scrollTop: '-=700'
            }, 'slow');
        },
        scrollDown: function () {
            $('html, body').animate({
                scrollTop: '+=700'
            }, 'slow');
        },
        scrollToTop: function () {
            while (target != null && !isScrollable(target)) {
                target = target.parentNode;
            }
            if (target != null && target.tagName !== "BODY" && target.tagName !== "HTML") {
                console.log(target)
                target.scrollTop = 0;
            }
            $('html, body').animate({
                scrollTop: 0
            }, {
                duration: 50
            });
        },
        scrollToBottom: function () {
            while (target != null && !isScrollable(target)) {
                target = target.parentNode;
            }
            if (target != null && target.tagName !== "BODY" && target.tagName !== "HTML") {
                console.log(target)
                target.scrollTop = target.scrollHeight;
            }
            $('html, body').animate({
                scrollTop: $(document).height()
            }, {
                duration: 50
            });
        },
        back: function () {
            window.history.back();
        },
        forward: function () {
            window.history.forward();
        },
        reload: function () {
            window.location.reload();
        },
        reloadWithoutCache: function () {
            window.location.reload(true);
        }
    };
    var gestures = {
        u: {
            label: 'Scroll to top',
            fn: defaultFn.scrollToTop,
        },
        d: {
            label: 'Scroll to bottom',
            fn: defaultFn.scrollToBottom,
        },
        r: {
            label: 'Back',
            fn: defaultFn.back,
        },
        l: {
            label: 'Forward',
            fn: defaultFn.forward,
        },
        ud: {
            label: 'Reload',
            fn: defaultFn.reload,
        },
        ur: {
            label: 'New tab',
            fn: defaultFn.newTab,
        },
        du: {
            label: 'Duplicate tab',
            fn: defaultFn.duplicateTab,
        },
        dl: {
            label: 'Open link in new tab',
            fn: defaultFn.openInNewTab,
            onLink: true
        },
        dr: {
            label: 'Close tab',
            fn: defaultFn.close,
        },
        udu: {
            label: 'Reload without cache',
            fn: defaultFn.reloadWithoutCache,
        },
        dld: {
            label: 'Open link in new background tab',
            fn: defaultFn.openInNewBackgroundTab,
            onLink: true
        },
    };

    var $mouseGestures = $('<div/>', {
        class: 'mouse-gestures'
    }).appendTo($('body'));

    var $up = $('<div/>', {
        class: 'mouse-gestures-up'
    }).appendTo($mouseGestures);
    var $upIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAACTElEQVRoge2XS2sTURiG3+9YUZFQLK6Ke11YMZRiMwFxUS/FmH8QiBhTETf2l7gQL1hR8B+klap0IUImdRXxhuKyZXChiA2DaMn5XMjZxM7knMmZns15tvmY93kWuQEet1BeD55qrS3sGx+/DWb83tq68a46dz+PnVwCplprC/snJu4KIQgAuC8R//x+80Pl7C3bW9YDBuUVeUVYDTi+/OLagUOH7wzKK6SU/OvHt+vvL527Z2vTWsBsp1vuS34lSIi0u+3tP/Lrl4+no0a9bWM3dUyX2U63zEyrw+QBYGxsrwDT6uTS47KN7ZEDlDyAgs49EQFAwVbESAGlsBuYyA9QANPzIw8enRnFIXNAKewGEvQM2eQVByXEyigRmQIsyStGijAOsCyvyBxhFJCTvCJThHZAzvIK4witgF2SVxhFDA3YZXmFdkRqgKF8rGsHoKdxoxWRGFAK3x4zkO8R8XmNu38Qz0M/ojX58MnRpIPEAAmuQF9+fr1U1P5xFjXqbYOIAvXlxaQXEwMEaEVjwFheYRDR4z3iabJnAp3gxCcBvpAyEBNxNYu8ImrU22CRuiEgq9GV2uekZ6S+iTtBMUyIiIm4sl4qvjRT/p+oWQsTImIBWdm8ejl1Y+jH6A4R1uQVO0RoyQOaX2SdoBj2Jc0wYbEvadqmvCJq1kIIMUPEixBiWkcesPyf+FT4hnXuXgcnre1a+UvpEh/gGh/gGh/gGh/gGh/gGh/gGh/gGh/gGh8wwObQC8aGzUGrAUSiibQIxoYgatrc9LjmL3mDBSk7vPlTAAAAAElFTkSuQmCC'
    }).appendTo($up);
    var $upLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).text(gestures[gesture + 'u'].label).appendTo($up);

    var $down = $('<div/>', {
        class: 'mouse-gestures-down'
    }).appendTo($mouseGestures);
    var $downIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAELUlEQVRoge2ZzWsVVxjGn3ciVAgXqcqdYuzCUupdWLCLbm423XmjsQgllKxLG4q4cOGmf0A3JbTgwkbxTyiKpibQTTe5C+tCcHMtubWLYpOYWukQIW3mPF3M98yZZMb7DrXge+HOzJmP83vejzkzc4BX9t+aaF7s5A9PzwiwQGACAMDsfgK/GeKzB6cOLmn16WhdCABAfEtgAkQGngQY/B11wAXNLvdpXgzA0Qic2b+4kcCbmh1qCwiZi7lD28EKpiqAe4E3oEI9AlZvx2mlr0A5AumN9CoLbVrWSASSRTEc2hp0BbDc2/ny0DLdFLJ5PA+uLEQ9AvGiAN5ECTdZxKnGJm+l+kUMxCFoegwA1FOoHJqWNg1TLuL8iq0edBU0V8SZlWDDWtwjWsMRCIezpp7k0FAESsFf/kcJltxK/zeP0+mNzMJygI41/DAXtbHYpmSVBbx7e7NjwNMO5M6Ds4cHtmOyEUg2qo4BRxYedShyWsg7j+eOWfvIW6WX+hM317s+zV1jOL9jzL3OjScflB4cvLzHvIxe8PeAb1/9tUvgLoB5itx749qj8j7qCDhxc73riyyTaIVN4yJctIoIR+IMeLIr+TpRgF/tOuQykOqDslhFxK4COiF8fOEIAhiHcLFz4/dMBzZvJwEJd+T421dXu45x0vCRVRJRKuCd25sdEVkG0UqBp6nGAefW8e/WJ23nW8Fz/O3Lq5Ml8GkRt45c/+V4bQH7fH+aRCt2aJID6TRpQbAUicimSUJMpgITKmh/PZgU4dIu8JG16DtnagvYGRtbBOBVKMoWEYnIeTsTteSc17/8aZIwVeABwJMx831tAT+fPTygzykAnq0okfV2i+BSjj9ZidsYfmJEVfgtCj98/MlbD2sLAICHH7krEPRAeDF37NmUoqCtVQCPVpkPR2X46bVPj/2420F73kYH59y+OOiR8KxFWZImGfDU/opPE5XgKwmIRDgGPYCetSitaZIaiQsB0IGvLAAABjNu3zfSI8J02jtNkA9AhRG5FjxQc35gOOP2DSWuCZu3k+LOgxPRrxTeoBZ8bQFAKALSI4N0ihlL6oFMYZdHYAsG02uf14MHXnCGZjjj9ilODwgK25YmMXZu3LDwb4HyQvDACFNMwxm3Tz8QEZExnSaFGrGMJSPCAyPOkQ1n3T6M0yPpZT7q5sCzA2C84ZFyahR4QGGSbzjr9oXswcArBw/cz+TDlydwpjYuvL0yav8qs5TD2Ym+jHHK943Jg5PMFLe//Y+BYGrjYmdkeEBxmnX48cTK32ub540xjL2dK27jG24/e3b+zy/eV4EHlCe6AaA9f39uf/vQFcdxJJ37xvfxfOOPi5uX3vtGsz91AQDQ/ur+3H730BVxHAEA7vh4/kQfHmhIABCIeO3ggcsAsf30rwsbl06qztC/spfF/gXOHOGnWcWqWAAAAABJRU5ErkJggg=='
    }).appendTo($down);
    var $downLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).text(gestures[gesture + 'd'].label).appendTo($down);

    var $left = $('<div/>', {
        class: 'mouse-gestures-left'
    }).appendTo($mouseGestures);
    var $leftIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAADU0lEQVRoge2YTW8bVRSGn3MnrOi0EghHmKYJn0lVb7OZbFjSdlQpUkFixYKSNBUs+AHs+ANI/Ugidc0iVGolU7u7brLpPsJFUXEUMB6JSBRrJATNPSw6k9rjz6RjM5H8yp4ZX12d+z5zz71nPDDWWGON9X9K0gr0wQ+1OWu58Mxwv3o5X0krbj+lAvDuRuAJtoziooRY/O1P33yYRux+Mi8bYG4j8IxoWRAXAYRXMRTf+/73D1Pw11cvBTC3EXjWaFnARUCeH0YKceQUmr0TLCCUVHFB4090jn4ojX2x87988tbj1BwndKQZmL0XLIihBLgiQHTnX1wezITrIBfTs9uuQwPM3gsWRKWESGQeekA0HPTHNA0ndSiAwt3AM0hJBBcAEXpAhMClx0NMHwBn0I6FYuBZTDk2HxtHhKZLIoLQUfV//nj4W+lAAIVi4KmaMoILybtOKwSExqpfGYH5aLzeKhT3PNCyom7zTgOK6vM+8RnVEKxfWRyNeegzA4XinidGy4AriUXaYSZCMH5lcXJk5qEHQOHBnicSmY+NdocIUfEri2+M1PyBjaRmVreunpjK3TDGmIOiRJQqTYWqTzol2roWu7a2tritbb9idWnns6kSdNhGZ1a3rrpncjcdx5iWokSUKtJzJloXdv860bGtLW5r22kVWYv9tgDMrG0tn5yevGkcRzoOlhEIEZlqA5hZ21o+dWbylpkw0nOwjEC0Abj516+bV8yLMbIOkQToGDjDEG0Af/2296Xdt3psIJIA1eVza0+r9ZXjAtEGEEM0durXjgHEbkcAgCdL51af7tZX/v37H5tRiF2jLMV+m7KpVa99+8hTkTJEz/69FarF//Ob+Ww8SsTKffeTp1YHh0D8P74+O1KIngAAuRvbnujgEKL49a/eHxlEXwCA3Pq2Z6wZGAIVv77ydjb+0MTKKsTAAAC59apnDpFOWIYOcSgAgPytnQU1tsRgEA3Z1/natXey82KrtjK9KY45j0gDiYpD96+rEyZbL7YAalemN8XIeaDRp2tDHJudF1vNql2Z3hT4iO4QoYpeqn0+vPSBI6yBpPLrVU8hubBDFfXrX2RsF+qmBMTIzENKAAD5209m9ZlckAm9P+y0GWusscbKjv4DVONMBpoa3a4AAAAASUVORK5CYII='
    }).appendTo($left);
    var $leftLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).text(gestures[gesture + 'l'].label).appendTo($left);

    var $right = $('<div/>', {
        class: 'mouse-gestures-right'
    }).appendTo($mouseGestures);
    var $rightIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAADCklEQVRoge2YzU8TQRiHf+9sOdWNUeMSq6GgMVTx4MXLevHY4mpMhL/Aj0q0iXr35tlo8IOSePLgAQ4aG6g3L3LgDFoISqNYKWqCqZtotPN6KC2ldLttYdc12V+aTjOZzDxPZmZntoAfP378/MuQm4N1j+ciAYl+ITAxPxDKbEefrgkceprXScg0CCoIJgBjYXDfq632K7aBzTY18CBQkIhSkbHPp7bat+MCdeCx9glKsXUJR5dQ93guEijSdB34yhcRCmDE5s53vm5nDEdnQCmSYQMPACoJTPY+z59sZwxnBRROgVBoAF8qiVRiakvCUYH5gVCGIaIlCVjBl3+rAvTy2IsvLe0Jxzfxu8HOKYUpCkKhAXy5DEpGqhUJ186ByFheZwVpAKoFPLC+1EwCjJkze23PCVdP4sizvA5GGkQqYAm/VpIJZlsJVwWANQlQmghVEpvgSyXBZGJjJmYt4cpJXJ3Muc4pgKMACjbwABAkUOr4pPWeqMxA+MnSaQBJgPZv6LDRIOUeGj/nrTasHXylTkopf3xcuZq90jdSK1A9AyNehAcBiiKE2qU9DD+avdZAgA54Eb7cRigK7Qxrw13JN9frC3gYvtyv6FCwq0u7052cjW8S8Dp8uU50CNoR2jNcfwY8Dl871sYZ+E/gZVFy4dO3RJk7sO7ifXguFvE9u3IzG+9LbpoBEJa8DC+Lkr9n84ls/OhdVKUiIIguQ2DJi/C/f/7i1Q/5xGK87z5qQrUVbmT37WmdidJA6T5kE5MljNVbJ+reh1wX0O691Vly8/Ag4+uNI5aXOVcFtAcLOnHz8MQwlhOHvXGd1kYXdCFF0/BgMpaHerzxQuMUPOCCgDaa1UULywYSTcMDDguEkosRBqbRHHyBpIjlhsIt/cEVsG/SfiSRQc3CC4rl4q3BAw6/UgrmFICCTbMS/MXW4QGHBXLxngwBUVhLmEx8tl14wKWnUGg0qzNQu5FNJjaWLzW/YevFtXOgRmJb4AGXT+LQ4/e9/If6KcATuQsH59wc248fP36cyV9vvQS/1jbNggAAAABJRU5ErkJggg=='
    }).appendTo($right);
    var $rightLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).text(gestures[gesture + 'r'].label).appendTo($right);

    var $middle = $('<div/>', {
        class: 'mouse-gestures-middle'
    }).appendTo($mouseGestures);
    var $middleIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAADtklEQVRoge2ZXWyTZRTHf+dtKTLWFtgYAn5EjRpkMSFE4wXEmIh4022Ngjfe72IxEIQbdfGVGEj8SLjHKyMXMM0olaB4QeINoEUIOMoyFrIwhjCU7i2MCWuPFy4Mm7V93j5tKkl/V017zv+cf56c532evtCgvkg9ih4a97LAqCKnHOXg2NLmRLfIvUq06mVAC74aQtjR0RpJ+NVyqtSTL+bnJptxpB10G3AeeBalP3nd2+Wq+uqpLivwIAdUAwvGvR5EvlCYJ8ruWFvkA9P8uhhIjnuZPJwV0b2xlsg3IqKJPzMbnLxzWCGo0NW5NHLIRMvKwMl0uiXkBOOoxIDnQR4DXbhmdArgNsgo6AXQJNNOP2+u/gv+OwMCh7l3a3NsxYrJxPWJLSKyBxi62hpebTLYFRlIpcaanPCd7aK6HQgX/j5joJAs8Dl3pr7sX/dMKJhzOlTlM2AZwncdrZG3j6kGszeyZ4FVorIp1hb+tlwvvof4zODgymDz5M+i+slczZcgDOxkwSPH479djcZao1+r6jrAQ3krOe7FXhOZFvgKQEU7TUR9GUgNDD+hGvhVYa2fvAJeRPPH+fHc451t0YsKOwHyIj0AEpCjM3EvmYgZG0ilxpoCARLAcr8dz8FyApIgmWpSJ3gAwFF9BSCXmxqZiVlpImQ8A6cHhz9G1S0V8/v5NPv293Etp1x6I07m6edKiyq9bGj/1LSHuTBagZPpdAuq75eL27e/j5uZCUJZj6eOHiwvLOzgh4ElJj0Uw8hAyAnGMRjYm5mJ2ZzsRInI+0SYh9GwFsNsBv7d52uD5jts0s0MCC/YFCnTwiqrbKMo5VGbImXEjXabYphuo802RWqpXdXj9OJF0fuf74ajJSKrR1UNvPvOZpYsXsTdcJRLG7uqKV0UowfZ6QsXC29QJSlymCvO6+0Vn4rrciOrJg+9gaBJ0Jq+ZK37qJiHfgUaBupNw0C9aRioNw0D9cbUwN817OG2TbKpAc+mSBlu2CSbGrhsU6QMI+VDimN6qT9jU6SM+CmbbDMDef3JpkhpbY7YpBsamP89tZmDK2jmmI2AmQG35xaqe2wKzYnqLlx32kbC/DmQ93YD52yKFfALyxbutRUxN+C6UyCbgGu2RYFhcsE43d0VvRt+EH9P4t6tg+CsBwYqLyknEH0V972xyjVm8X+U6N0yRDSwFtEPQf7wkXkZdCu5zHo+2nbFd90i2L1mdd0QTqQLRzaivAw8yezf8B4wAnoC4QjTXtJ2YBv8H/kHo4smFtKsVmsAAAAASUVORK5CYII='
    }).appendTo($middle);
    var $middleLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).appendTo($middle);

    var timeoutDelay;
    $(document).on('mousedown', function (e) {
        if (e.which == 3) {
            getValues(e);
            getTypes();
            preventContextMenu = false;
            mouseDownTriggered = true;
            startX = e.clientX;
            startY = e.clientY;
            gesture = '';
            target = e.target
            loadMG();
            timeoutDelay = setTimeout(function () {
                showMG(e);
            }, 500);
            $(this).on('mousemove', function (e) {
                if (startY - e.clientY > 10 || e.clientY - startY > 10 || startX - e.clientX > 10 || e.clientX - startX > 10) {
                    preventContextMenu = false;
                    if (mouseDownTriggered) {
                        mouseDownTriggered = false;
                    } else {
                        clearTimeout(timeoutDelay);
                        showMG(e);
                        checkMG(e);
                    }
                }
            });
        }
    }).on('mouseup', function (e) {
        clearTimeout(timeoutDelay);
        $(this).off('mousemove');
        if (checkTypeItemMG('link', gesture, true)) {
            switch (gesture.slice(-1)) {
                case 'u':
                    $down.addClass('hide');
                    $left.addClass('hide');
                    $right.addClass('hide');
                    break;
                case 'd':
                    $up.addClass('hide');
                    $left.addClass('hide');
                    $right.addClass('hide');
                    break;
                case 'l':
                    $up.addClass('hide');
                    $down.addClass('hide');
                    $right.addClass('hide');
                    break;
                case 'r':
                    $up.addClass('hide');
                    $down.addClass('hide');
                    $left.addClass('hide');
                    break;
            }
            $mouseGestures.delay(300).hide(0);
        } else {
            $mouseGestures.hide();
        }
        gesture = '';
    }).on('contextmenu', function (e) {
        if (preventContextMenu) e.preventDefault();
    });

    function showMG(e) {
        preventContextMenu = true;
        $mouseGestures.css({
            left: (e.clientX - $mouseGestures.width() / 2) + "px",
            top: (e.clientY - $mouseGestures.height() / 2) + "px"
        }).stop(true, true).show();
    }

    function checkMG(e) {
        checkMove(startY - e.clientY, 'u', e);
        checkMove(e.clientY - startY, 'd', e);
        checkMove(startX - e.clientX, 'l', e);
        checkMove(e.clientX - startX, 'r', e);
    }

    function checkMove(p, t, e) {
        if (p >= SENSITIVITY) {
            startX = e.clientX;
            startY = e.clientY;
            if (gesture[gesture.length - 1] != t) {
                gesture += t;
                loadMG();
            }
        }
    }

    function loadMG() {
        if (checkTypeItemMG('link', gesture + 'u')) {
            $up.removeClass('active hide');
            $upLabel.text(gestures[gesture + 'u'].label);
        } else {
            $up.addClass('hide');
        }
        if (checkTypeItemMG('link', gesture + 'd')) {
            $down.removeClass('active hide');
            $downLabel.text(gestures[gesture + 'd'].label);
        } else {
            $down.addClass('hide');
        }
        if (checkTypeItemMG('link', gesture + 'l')) {
            $left.removeClass('active hide');
            $leftLabel.text(gestures[gesture + 'l'].label);
        } else {
            $left.addClass('hide');
        }
        if (checkTypeItemMG('link', gesture + 'r')) {
            $right.removeClass('active hide');
            $rightLabel.text(gestures[gesture + 'r'].label);
        } else {
            $right.addClass('hide');
        }

        if (checkTypeItemMG('link', gesture)) {
            switch (gesture.slice(-1)) {
                case 'u':
                    $up.removeClass('hide').addClass('active');
                    break;
                case 'd':
                    $down.removeClass('hide').addClass('active');
                    break;
                case 'l':
                    $left.removeClass('hide').addClass('active');
                    break;
                case 'r':
                    $right.removeClass('hide').addClass('active');
                    break;
            }
        }
    }

    function getValues(e) {
        values = {};
        values.$target = $(e.target);
        if (values.$target.closest('a').length) {
            values.link = values.$target.closest('a').prop('href');
        }
    }

    function getTypes() {
        types = {};
        if (typeof values.link !== 'undefined') {
            types.link = true;
        }
    }

    function checkTypeItemMG(type, gesture, runFunction) {
        if (gestures[gesture]) {
            if (gestures[gesture]['on' + type.toCapitalize().replace(' ', '')]) {
                if (types[type]) {
                    if (runFunction === true) {
                        gestures[gesture].fn(values[type]);
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                if (runFunction === true) {
                    gestures[gesture].fn();
                }
                return true;
            }
        } else {
            return false;
        }
    }

    String.prototype.toCapitalize = function () {
        return this.replace(/(\b)([a-zA-Z])/g, function (m) {
            return m.toUpperCase();
        });
    };

    function isScrollable(ele) {
        // Compare the height to see if the element has scrollable content
        const hasScrollableContent = ele.scrollHeight > ele.clientHeight + 50;

        // It's not enough because the element's `overflow-y` style can be set as
        // * `hidden`
        // * `hidden !important`
        // In those cases, the scrollbar isn't shown
        const overflowYStyle = window.getComputedStyle(ele).overflowY;
        const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

        return hasScrollableContent && !isOverflowHidden;
    };
})();
