// JavaScript source code
var Itanio = Itanio || {};

Itanio.ProxyLogAcesso = (function ($) {
    var $public = {}, $private = {};

    $private.DESENVOLVIMENTO = "Desenvolvimento";
    $private.HOMOLOGACAO = "Homologacao";
    $private.PRODUCAO = "Producao";

    $(function () {
        $private.Ambiente = $('script[data-ambiente][data-nome="leads.js"]').data("ambiente");
     
        switch ($private.Ambiente)
        {
            case $private.DESENVOLVIMENTO:
                $private.API_URL = "http://localhost:3000";
                break;
            case $private.HOMOLOGACAO:
                $private.API_URL = "http://it_server/Leads";
                break;
            case $private.PRODUCAO:
                $private.API_URL = "http://leads.itanio.com.br";
                break;
        }
    });
    
    $public.logarAcesso = function (acesso) {
        return $.ajax({
            dataType: "json",
            type: "POST",
            url: $private.API_URL + "/Acesso/Logar",
            crossDomain: true,
            data: { acesso: acesso }
        });
    };

    return $public;
})(jQuery);

Itanio.LogAcesso = (function (proxy) {
    var $public = {}, $private = {};

    $(function () {
        $private.IdControleEmail = $('script[data-controle-email][data-nome="leads.js"]').data("controle-email");
        $private.IdControleNome = $('script[data-controle-nome][data-nome="leads.js"]').data("controle-nome");
        $private.LinkDownload = $('script[data-controle-download][data-nome="leads.js"]').data("controle-download");
       
        if (!$private.IdControleEmail)
            $private.IdControleEmail = "email";
        if (!$private.IdControleEmail)
            $private.IdControleEmail = "nome";
        if (!$private.LinkDownload)
            $private.LinkDownload = "download";
    });

    $private.CHAVE_ID_USUARIO = "Itanio.LogAcesso.IdUsuario";

    $private.criarCookie = function (nome, valor, dias) {
        var expiraEm;
        if (dias) {
            var data = new Date();
            data.setTime(data.getTime() + (dias * 24 * 60 * 60 * 1000));
            expiraEm = "; expires=" + data.toGMTString();
        }
        else {
            expiraEm = "";
        }
        document.cookie = nome + "=" + valor + expiraEm + "; path=/";
    };

    $private.obterCookie = function (nomeCookie) {
        if (document.cookie.length > 0) {
            var indiceCookieInicio = document.cookie.indexOf(nomeCookie + "=");
            if (indiceCookieInicio != -1) {
                indiceCookieInicio = indiceCookieInicio + nomeCookie.length + 1;
                var indiceCookieFim = document.cookie.indexOf(";", indiceCookieInicio);
                if (indiceCookieFim == -1) {
                    indiceCookieFim = document.cookie.length;
                }
                return unescape(document.cookie.substring(indiceCookieInicio, indiceCookieFim));
            }
        }
        return "";
    };

    $private.gerarSecaoGUID = function() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }

    $private.gerarGUID = function () {
     
        return $private.gerarSecaoGUID() + $private.gerarSecaoGUID() + '-' + $private.gerarSecaoGUID() + '-' + s$private.gerarSecaoGUID() + '-' +
          $private.gerarSecaoGUID() + '-' + $private.gerarSecaoGUID() + $private.gerarSecaoGUID() + $private.gerarSecaoGUID();
    }

    $private.obterIdUsuarioCorrente = function () {
        var guid = $private.obterCookie($private.CHAVE_ID_USUARIO);
        if (guid === "") {
            guid = $private.gerarGUID();
            $private.criarCookie($private.CHAVE_ID_USUARIO, guid);
        }
        return guid;
    };

    $private.logarErro = function (xhr, textStatus, errorThrown) {
        console.log("Erro no leads.js: " + errorThrown);
    };

    $private.obterTipoNavegador = function () {
        var tipo = "Outro";

        var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        if (isOpera)
            tipo = "Opera";
        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if (isFirefox)
            tipo = "Firefox";

        // At least Safari 3+: "[object HTMLElementConstructor]"
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        if (isSafari)
            tipo = "Safari";
        // Internet Explorer 6-11
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        if (isIE)
            tipo = "InternetExplorer";
        // Edge 20+
        var isEdge = !isIE && !!window.StyleMedia;
        if (isEdge)
            tipo = "Edge";

        // Chrome 1+
        var isChrome = !!window.chrome && !!window.chrome.webstore;
        if (isChrome)
            tipo = "Chrome";
        
        // Blink engine detection
        var isBlink = (isChrome || isOpera) && !!window.CSS;
        if (isBlink)
            tipo = "Blink";

        return tipo;
    };

    $private.logarDownload = function () {
        
        var acessoViewModel = {
            url: window.location.href,
            guid: $private.obterIdUsuarioCorrente(),
            email: $("#" + $private.IdControleEmail).val(),
            nome: $("#" + $privateIdControleNome).val(),
            tipo: $private.obterTipoNavegador(),
            nomeArquivo : $(this).attr("href")
        };
        proxy.logarAcesso(acesso).fail($private.logarErro);
    };

    $public.rastrear = function () {
        var acessoViewModel = {
            url: window.location.href,
            guid: $private.obterIdUsuarioCorrente(),
            email: $("#" + $private.IdControleEmail).val(),
            nome: $("#" + $privateIdControleNome).val(),
            tipo: $private.obterTipoNavegador(),

        };
        proxy.logarAcesso(acesso).fail($private.logarErro);

        $("#" + $private.LinkDownload).on("click", $private.logarDownload);
    };

    return $public;
})(Itanio.ProxyLogAcesso);


Itanio.LogAcesso.rastrear();