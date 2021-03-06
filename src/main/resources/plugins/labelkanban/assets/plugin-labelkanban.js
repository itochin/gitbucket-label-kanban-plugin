
//var basePath;
//var prefix;

if(!String.prototype.startsWith){
    String.prototype.startsWith = function(prefix){
        return this.lastIndexOf(prefix, 0) === 0;
    }
}

var kanbanApp = new Vue({
    el: "#kanban-app",

    data: {
        message: ""
        ,
        /**@type {issue}*/
        dragItem: undefined
        ,
        targetLabel: undefined
        ,
        /**@type {lalbel[]} */
        labels: []
        ,
        /**@type {issue[]}*/
        issues: []
        ,
        /**
         * @param {label} label
         * @returns {issue[]}
         */
        getIssues: function (label) {
            if (label && label.name) {
                return this.issues.filter(function (issue) {
                    return issue.labels.some(function (value) {
                        return value.name == label.name;
                    });
                });
            }
            else {
                return this.issues.filter(function (issue) {
                    return issue.labels.every(function (_label) {
                        return !_label.name.startsWith(prefix);
                    })
                });
            }
        }
        ,
        /**
         * @returns {string}
         */
        getColWidth: function () {
            var width = (100 - 2) / this.labels.length - 2;
            return Math.round(width) + "%"
        }
    }
    ,
    methods: {
        /**
         * @param {issue} item
         * @param {DragEvent} e
         */
        dragstart: function (item, e) {
            this.draggingItem = item
            e.target.style.opacity = 0.5;
        }
        ,
        /**
         * @param {DragEvent} e
         */
        dragend: function (e) {
            e.target.style.opacity = 1;
            this.changeLabel(this.draggingItem, this.targetLabel);
            this.targetLabel = undefined;
            this.draggingItem = undefined;
        }
        ,
        /**
         * @returns {boolean}
         */
        dragenter: function () {
            event.preventDefault();
        }
        ,
        /**
         * @param {label} label
         */
        dragover: function (label) {
            this.targetLabel = label;
            event.preventDefault();
        }
        ,
        /**
         * @param {issue} issue
         */
        showComments: function (issue) {
            issue.show = !issue.show;
            if (!issue.comments) {
                this.loadComments(issue);
            }
        }
        ,
        /**
         * @param {label} label
         * @returns {object}
         */
        getLabelStyle: function (label) {
            var isTarget = (this.targetLabel && this.targetLabel.name == label.name)
            return {
                'background-color': (isTarget ? "#f5f5f5" : "transparent"),
            };
        }
        ,
        /**
         * @param {label} label
         * @returns {object}
         */
        getLabelHeaderStyle: function (label) {
            var color = (label && label.color) ? "#" + label.color : "silver";
            return {
                'border-top-color': color
            }
        }
        ,
        loadIssues: function () {
            $.ajax({
                url: basePath + 'issues/',
                dataType: 'json'
            })
                .done(function (data) {
                    kanbanApp.issues = data.filter(function (issue) {
                        issue.show = false;
                        issue.comments = null;
                        return issue.state == "open";
                    });
                })
                .fail(this.ajaxFial);

        }
        ,
        loadLabels: function () {
            $.ajax({
                url: basePath + 'labels/',
                dataType: 'json'
            })
                .done(function (data) {
                    kanbanApp.labels = [{ "name": "", "color": "silver", "url": "" }].concat(
                        data.filter(function (label) {
                            return label.name.startsWith(prefix);
                        }).reverse()
                    );
                })
                .fail(this.ajaxFial);

        }
        ,
        /**
         * @param {issue} issue 
         * @param {label} label 
         */
        changeLabel: function (issue, label) {
            var labelUrl = issue.comments_url.replace(/comments$/, "plugin/labelkanban/labels/");

            var oldLabel = null;

            for (i = issue.labels.length - 1; i >= 0; i--) {
                if (issue.labels[i].name.startsWith(prefix)) {
                    oldLabel = issue.labels[i];

                    $.ajax({
                        url: labelUrl + "delete/" + oldLabel.name,
                        type: "POST"
                    })
                        .fail(this.ajaxFial);

                    issue.labels.splice(i, 1);

                }
            }

            if (label && label.name) {
                $.ajax({
                    url: labelUrl + "new/" + label.name,
                    type: "POST"
                })
                    .fail(this.ajaxFial);

                issue.labels.push(label);
            }
        }
        ,
        /**
         * @param {issue} issue 
         */
        loadComments: function (issue) {
            $.ajax({
                url: issue.comments_url,
                dataType: 'json'
            })
                .done(function (data) {
                    issue.comments = data;
                })
                .fail(this.ajaxFial);

        }
        ,
        /**
         */
        ajaxFial: function (jqXHR, textStatus, errorThrown) {
            this.message = (jqXHR.responseJSON && jqXHR.responseJSON.message) ?
                jqXHR.responseJSON.message :
                textStatus;
        }
    }
});



$(function () {
    kanbanApp.loadLabels();
    kanbanApp.loadIssues();
});

/**
 * @typedef {object} user
 * @prop {string} login
 * @prop {string} email
 * @prop {string} type
 * @prop {boolean} site_admin
 * @prop {string} created_at
 * @prop {number} id
 * @prop {string} url
 * @prop {string} html_url
 * @prop {string} avatar_url
 */

/**
 * @typedef {object} label
 * @prop {string} name
 * @prop {string} color
 * @prop {string} url
 */

/**
 * @typedef {object} comment
 * @prop {number} id
 * @prop {user} user
 * @prop {string} body
 * @prop {string} created_at
 * @prop {string} updated_at
 * @prop {string} html_url
 */

/**
 * @typedef {object} issue
 * @prop {number} number
 * @prop {string} title
 * @prop {user} user
 * @prop {label[]} labels
 * @prop {string} state
 * @prop {string} created_at
 * @prop {string} updated_at
 * @prop {string} body
 * @prop {number} id
 * @prop {string} comments_url
 * @prop {string} html_url
 * @prop {boolean} show //optional
 * @prop {comment[]} comments //optional
 */

