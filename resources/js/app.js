$(function(){
    var clipboard = new Clipboard('.each-copy'),
        param = function() {
                    // This function is anonymous, is executed immediately and 
                    // the return value is assigned to QueryString!
                    var query_string = {};
                    var query = window.location.search.substring(1);
                    var vars = query.split("&");
                    for (var i = 0; i < vars.length; i++) {
                        var pair = vars[i].split("=");
                        // If first entry with this name
                        if (typeof query_string[pair[0]] === "undefined") {
                            query_string[pair[0]] = decodeURIComponent(pair[1]);
                            // If second entry with this name
                        } else if (typeof query_string[pair[0]] === "string") {
                            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                            query_string[pair[0]] = arr;
                            // If third or later entry with this name
                        } else {
                            query_string[pair[0]].push(decodeURIComponent(pair[1]));
                        }
                    }
                    return query_string;
                }(),
        debug = (param.debug && param.debug.toLowerCase() === 'true') ? { debug : true } : {},
        templateHTML = '<div class="col-md-4 each-block">' + 
                            '<h5 class="each-heading">${heading}</h5>' + 
                            '<form class="form-inline">' + 
                                '<div class="form-group">' + 
                                    '<div class="input-group">' + 
                                        '<div class="input-group-addon each-label">Server</div>' + 
                                        '<input type="text" class="form-control" readonly="readonly" id="server" placeholder="Server" value="${server}">' + 
                                        '<div class="input-group-addon each-copy" data-clipboard-target="#server">copy</div>' + 
                                    '</div>' + 
                                    '<div class="input-group">' + 
                                        '<div class="input-group-addon each-label">Server Port</div>' + 
                                        '<input type="text" class="form-control" readonly="readonly" id="server_port" placeholder="Server Port" value="${server_port}">' + 
                                        '<div class="input-group-addon each-copy" data-clipboard-target="#server_port">copy</div>' + 
                                    '</div>' + 
                                    '<div class="input-group">' + 
                                        '<div class="input-group-addon each-label">Password</div>' + 
                                        '<input type="text" class="form-control" readonly="readonly" id="password" placeholder="Password" value="${password}">' + 
                                        '<div class="input-group-addon each-copy" data-clipboard-target="#password">copy</div>' + 
                                    '</div>' + 
                                    '<div class="input-group">' + 
                                        '<div class="input-group-addon each-label">Method</div>' + 
                                        '<input type="text" class="form-control" readonly="readonly" id="method" placeholder="Method" value="${method}">' + 
                                        '<div class="input-group-addon each-copy" data-clipboard-target="#method">copy</div>' + 
                                    '</div>' + 
                                    '<div class="input-group">' + 
                                        '<div class="input-group-addon each-label">QR Code</div>' + 
                                        '<input type="text" class="form-control qr-link" readonly="readonly" id="qr-code" value="click here to show" url="${qr_img}" data-toggle="modal" data-target="#modal">' +  
                                    '</div>' + 
                                '</div>' + 
                            '</form>' + 
                        '</div>';

    $.ajax({
        url: (function(){
            if(window.location.origin.indexOf('.local') > -1 || window.location.origin.indexOf('local.') > -1){
                return window.location.origin + '/free-shadowsocks/data.php';
            }
            return 'http://labs.pakcheong.com/free-shadowsocks/data.php';
        })(),
        data: debug,
        dataType: 'jsonp',
        jsonp: 'callback',
        jsonpCallback: 'jsonpCallback',
        cache: false,
        crossDomain: true,
        success: function(obj){
            if(obj.status === 'success'){
                window[window.location.host] = { data: obj.data };
                console.warn('Data saved in window["' + window.location.host + '"].data');
                var data = obj.data;
                for(var i=0; i<data.length; i++){
                    var tmp = templateHTML;
                    tmp = tmp.replace('${heading}', data[i].remarks);
                    tmp = tmp.replace('${server}', data[i].server);
                    tmp = tmp.replace('${server_port}', data[i].server_port);
                    tmp = tmp.replace('${password}', data[i].password);
                    tmp = tmp.replace('${method}', data[i].method);
                    tmp = tmp.replace('${qr_img}', 'https://api.qrserver.com/v1/create-qr-code/?size=238&data=' + data[i].qr_data);
                    $(tmp).appendTo($('.container > .row'));
                }
            }else{
                console.log(obj);
                console.log('Status: ' + obj.status);
                console.log('Message: ' + obj.msg);
                $('.container > .row').html('<h1 class="display-1 lead text-xs-center error">ERROR</h1>');
            }
        },
        error: function(){
            console.log(arguments);
            $('.container > .row').html('<h1 class="display-1 lead text-xs-center error">ERROR</h1>');
        },
        complete: function(){
            $('.container > .row').removeClass('loading');
        }
    });

    $('input[type=text]').click(function(){
        $(this).select();
    });

    $('#modal')
        .on('show.bs.modal', function (event) {
            var $this = $(this);
            $this.find('.modal-title').text('Loading QR code...');
            $this.find('.modal-body .img').html('<div class="loader"></div>');
        })
        .on('shown.bs.modal', function (event) {
            var $btn = $(event.relatedTarget),
                url = $btn.attr('url'),
                $this = $(this),
                $imgContainer = $this.find('.modal-body .img'),
                w = $imgContainer.width();
            $this.find('.modal-title').text('Scan me...');
            $imgContainer.find('.loader').height(w);
            $imgContainer.height(w);
            var img = new Image();
            img.onload = function(){
                $imgContainer.find('.loader').remove();
                $imgContainer.css('background-image', 'url(' + url + ')');
            };
            img.src = url;
        });

    clipboard.on('success', function(e) {
        $(e.trigger)
            .tooltip({
                title: 'Copied!'
            })
            .tooltip('show');
        setTimeout(function(){
            $(e.trigger).tooltip('dispose')
        }, 500);
        e.clearSelection();
    });

    clipboard.on('error', function(e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
    });

    $('footer > p').html($('footer > p').html() + ' ' + window.location.host);
});