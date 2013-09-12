﻿// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2013
// by DotNetNuke Corporation
// All Rights Reserved

(function (dnn) {
    'use strict';

    if (typeof dnn === 'undefined') dnn = {};
    if (typeof dnn.subscriptions === 'undefined') dnn.subscriptions = {};

    dnn.subscriptions.SearchController = function ($, ko, settings, root) {
        var that = this;

		this.servicesFramework = $.ServicesFramework(settings.moduleId);
        this.results = ko.observableArray([]);
        
        this.totalResults = ko.observable(0);
        
        this.localizer = function () {
            //return that.social.getLocalizationController();
        };
        
        this.search = function () {
            var startSearch = function () {
                $('.filter-content', settings.moduleScope).addClass('searching');
            };

            var finishSearch = function () {
                $('.filter-content', settings.moduleScope).removeClass('searching');
            };

            var success = function (model) {
                // Load the new results into our results array all at once to avoid flicker.
                var results = [];

                $.each(model.Results,
                    function (index, result) {
                        // $, ko, settings, root, social, model
                        results.push(new dnn.subscriptions.SearchResult($, ko, settings, root, social, result));
                    });

                that.results(results);
                that.totalResults(model.TotalResults || 0);

                finishSearch();
            };

            var failure = function (xhr, status) {
                var localizer = social.getLocalizationController();
                
                if ((status || new String()).length > 0) {
                    $.dnnAlert({
                        title: localizer.getString('SearchErrorTitle'),
                        text: localizer.getString('SearchError') + ': ' + (status || 'Unknown error')
                    });
                }

                that.results([]);
                that.totalResults(0);

                finishSearch();
            };

            startSearch();

            that.requestService('Subscriptions/GetSubscriptions', 'get', root.getSearchParameters(), success, failure, that.loading);
        };
	    
        this.requestService = function (path, type, data, success, failure, prevFunc) {
	        if(prevFunc != undefined) prevFunc.call(that);
		    $.ajax({
			    type: type,
			    url: that.servicesFramework.getServiceRoot('CoreMessaging') + path,
			    beforeSend: that.servicesFramework.setModuleHeaders,
			    data: data,
			    cache: false
		    }).done(function(response) {
			    success.call(that, response);
		    }).fail(function(xhr, status) {
			    failure.call(that, xhr);
		    });
	    };
        
        // Wait for other components to finish registration
        $(document).ready(function () {
            if (root.pageControl != null) {
                root.pageControl.page.subscribe(
                    function () {
                        that.search();
                    });
            }

            // Do an initial search.
            that.search();
        });
    };
})(window.dnn);