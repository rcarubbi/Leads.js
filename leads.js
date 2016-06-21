// JavaScript source code
var Itanio = Itanio || {};

Itanio.LeadsProxy = (function ($) {
    var $public = {}, $private = {};

    $private.DESENVOLVIMENTO = "desenvolvimento";
    $private.HOMOLOGACAO = "homologacao";
    $private.PRODUCAO = "producao";
    

    $(function () {
        $private.Ambiente = $('script[data-ambiente][data-nome="leads.js"]').data("ambiente");
     
        switch ($private.Ambiente)
        {
            case $private.DESENVOLVIMENTO:
                $private.API_URL = "http://localhost:3000/api";
                break;
            case $private.HOMOLOGACAO:
                $private.API_URL = "http://it_server:8081/api";
                break;
            case $private.PRODUCAO:
                $private.API_URL = "http://leads.itanio.com.br/api";
                break;
        }
    });

    $public.criarVisitante = function (visitante) {
        return $.ajax({
            dataType: "json",
            type: "POST",
            url: $private.API_URL + "/Visitante",
            crossDomain: true,
            data: visitante
        });
    };

    $public.logarAcesso = function (acesso) {
        return $.ajax({
            dataType: "json",
            type: "POST",
            url: $private.API_URL + "/Acesso",
            crossDomain: true,
            data: acesso
        });
    };

    $public.obterUrlArquivo = function (idArquivo) {
        return $.ajax({
            dataType: "json",
            type: "GET",
            url: $private.API_URL + "/Arquivo/" + idArquivo,
            crossDomain: true,
        });
    }

    return $public;
})(jQuery);

Itanio.Leads = (function (proxy) {
    var $public = {}, $private = {};

    $private.DESENVOLVIMENTO = "desenvolvimento";
    $private.HOMOLOGACAO = "homologacao";
    $private.PRODUCAO = "producao";

    $(function () {
        $private.IdControleEmail = $('script[data-controle-email][data-nome="leads.js"]').data("controle-email");
        $private.IdControleNome = $('script[data-controle-nome][data-nome="leads.js"]').data("controle-nome");
        $private.IdControleEnvio = $('script[data-controle-envio][data-nome="leads.js"]').data("controle-envio");
        $private.LinkDownload = $('script[data-controle-download][data-nome="leads.js"]').data("controle-download");
        $private.IdProjeto = $('script[data-projeto][data-nome="leads.js"]').data("projeto");
        $private.Ambiente = $('script[data-ambiente][data-nome="leads.js"]').data("ambiente");

        switch ($private.Ambiente) {
            case $private.DESENVOLVIMENTO:
                $private.CM_URL = "http://localhost:3001/Arquivo/Index/";
                break;
            case $private.HOMOLOGACAO:
                $private.CM_URL = "http://it_server:8081/Arquivo/Index/";
                break;
            case $private.PRODUCAO:
                $private.CM_URL = "http://leads.itanio.com.br/Arquivo/Index/";
                break;
        }



        $private.IdArquivo = $private.getQueryString("IdArquivo");

        if (!$private.IdControleEmail)
            $private.IdControleEmail = "email";
        if (!$private.IdControleNome)
            $private.IdControleNome = "nome";
        if (!$private.LinkDownload)
            $private.LinkDownload = "download";
        if (!$private.IdControleEnvio)
            $private.IdControleEnvio = "enviar";

        $("#" + $private.IdControleEnvio).on("click", $private.criarVisitante);
        $("#" + $private.LinkDownload).on("click", $private.logarDownload);
        $(document).on("click", ".download-conteudo", $public.rastrear);
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

    $private.gerarSecaoGUID = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    };

    $private.gerarGUID = function () {

        return $private.gerarSecaoGUID() + $private.gerarSecaoGUID() + '-' + $private.gerarSecaoGUID() + '-' + $private.gerarSecaoGUID() + '-' +
          $private.gerarSecaoGUID() + '-' + $private.gerarSecaoGUID() + $private.gerarSecaoGUID() + $private.gerarSecaoGUID();
    };

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
            email: $private.obterEmail(),
            nome: $("#" + $privateIdControleNome).val(),
            tipo: $private.obterTipoNavegador(),
            nomeArquivo : $(this).attr("href")
        };
        proxy.logarAcesso(acesso).fail($private.logarErro);
    };


    $private.obterEmail = function () {

        var email = $("#" + $private.IdControleEmail).val();
        if (!email)
        {
            email = $private.getQueryString("Email");
        }

        return email;
    };

    $public.rastrear = function (e) {
        
        var url = window.location.href;
        if ($(this).hasClass("download-conteudo"))
        {
            e.preventDefault();
            url = $(this).attr("href");
            $private.urlRedirect = url;
        }
        var acessoViewModel = {
            url: url,
            guid: $private.obterIdUsuarioCorrente(),
            email: $private.obterEmail(),
            tipoNavegador: $private.obterTipoNavegador(),
            userAgentInfo: navigator.userAgent,
            idProjeto: $private.IdProjeto,
            idArquivo: $private.IdArquivo
        };
       
        proxy.logarAcesso(acessoViewModel).done($private.verificarAlteracaoGuid).fail($private.logarErro)
        .success($private.baixarArquivo);

    };

    $private.verificarAlteracaoGuid = function (data, textStatus, jqXHR) {
        if (jqXHR.getResponseHeader("newGuid"))
        {
            $private.criarCookie($private.CHAVE_ID_USUARIO, jqXHR.getResponseHeader("newGuid"));
        }
    };

    $private.baixarArquivo = function () {
        if ($private.urlRedirect)
        {
            var temp = $private.urlRedirect;
            $private.urlRedirect = undefined;
            window.location.href = temp;
        }

       
    };

    $private.criarVisitante = function () {
        var visitanteViewModel = {
            email: $private.obterEmail(),
            nome: $("#" + $private.IdControleNome).val(),
            guid: $private.obterIdUsuarioCorrente(),
            idProjeto: $private.IdProjeto,
            idArquivo: $private.IdArquivo
        };

        proxy.criarVisitante(visitanteViewModel)
            .fail($private.logarErro)
            .success($private.redirecionarPaginaEmailEnviado);
    };

    $private.redirecionarPaginaEmailEnviado = function () {
        var destino = $private.updateQueryString("EmailEnviado.html", "IdArquivo", $private.IdArquivo);
        destino = $private.updateQueryString(destino, "Email", $("#" + $private.IdControleEmail).val())
        window.location.href = destino;
    };

    $public.exibirBotaoDownload = function (cssClass, texto) {
        $private.cssClass = cssClass;
        $private.texto = texto;
        $private.gerarLink($private.CM_URL + $private.IdArquivo + "?guid=" + $private.obterIdUsuarioCorrente())
    };

    $private.gerarLink = function (url) {
        $private.cssClass = $private.cssClass || "";
        $private.texto = $private.texto || "Baixar";
        var currentScript = $("script:contains('Itanio.Leads.exibirBotaoDownload(')");
        var link = $("<a href='" + url + "' class='download-conteudo " + $private.cssClass + "'>" + $private.texto + "</a>");
        currentScript.after(link);
    };

    $private.getQueryString = function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };


    $private.updateQueryString = function (uri, key, value) {
        var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i");
        separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    };

    return $public;
})(Itanio.LeadsProxy);

