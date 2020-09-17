Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    yieldTemplates: {
        header: {
            to: 'header'
        },
        footer: {
            to: 'footer'
        }
    },
    progressSpinner: false,
    progressDelay: 250,
    title: "Khidma - Job board and developer listing just for Arab speakers, MENA workers, SEA and beyond"
});

Router.map(function() {

    this.route('home', {
        path: '/',
        layoutTemplate: 'layoutNoContainer',
        data: function() {
            return {
                jobs: Jobs.find({
                    featuredThrough: {
                        $exists: false
                    },
                    status: "active"
                }, {
                    sort: {
                        createdAt: -1
                    },
                    limit: 10
                }),
                featuredJobs: Jobs.find({
                    featuredThrough: {
                        $gte: new Date()
                    },
                    status: "active"
                }, {
                    sort: {
                        featuredThrough: -1
                    }
                }),
                profiles: Profiles.find({}, {
                    sort: {
                        availableForHire: -1,
                        randomSorter: 1
                    },
                    limit: 8
                }),
                profile: Profiles.findOne({
                    userId: Meteor.userId()
                })
            };
        },
        subscriptions: function() {
            return [subs.subscribe('homeJobs'), subs.subscribe('featuredJobs'), Meteor.subscribe('homeDevelopers'), subs.subscribe('developerCount'), subs.subscribe('jobCount')];
        }
    });

    this.route('jobs', {
        path: '/jobs',
        title: "Khidma - All Jobs"
    });

    this.route('myJobs', {
        path: '/myjobs',
        title: "Khidma - My Jobs",
        data: function() {
            return {
                jobs: Jobs.find({
                    userId: Meteor.userId()
                }, {
                    sort: {
                        createdAt: -1
                    }
                })
            };
        },
        waitOn: function() {
            return subs.subscribe('my_jobs');
        }
    });

    this.route('job', {   //__originalId
        path: '/jobs/:__originalId/:slug?',
 //     path: '/jobs/:_id',
        title: function() {
            if (this.data())
                return "Khidma - " + this.data().title;
        },
        data: function() {
            console.log(this.params.__originalId);
            console.log(this.params);
         //  console.log(this.params.query);
         //  console.log(this.params.hash);
            return Jobs.findOne({
                _id: this.params.__originalId,
            });
        },
        waitOn: function() {
            return subs.subscribe("job", this.params.__originalId);
        },
        onBeforeAction: function() {
            var expectedSlug = this.data().slug();
            console.log(this.params.slug); //undefined
            console.log(expectedSlug);
            console.log(this.params.slug !== expectedSlug);
            console.log(this.params);
            console.log(history.state);
            if (this.params.slug !== expectedSlug) {
                console.log("redirect!!!");
                this.redirect("job", {
                    __originalId: this.params.__originalId,
                    slug: expectedSlug
                }, {replaceState: true} );
            } else {
                console.log("next!!!");
                this.next();
            }
        }
    } );

    this.route('jobhome', {   //__originalId
        path: '/jobs/:_id/:slug?',
 //     path: '/jobs/:_id',
        title: function() {
            if (this.data())
                return "Khidma - " + this.data().title;
        },
        data: function() {
            console.log(this.params._id);
         //  console.log(this.params.query);
         //  console.log(this.params.hash);
            return Jobs.findOne({
                _id: this.params._id,
            });
        },
        waitOn: function() {
            return subs.subscribe("jobx", this.params._id);
        },
        onBeforeAction: function() {
            var expectedSlug = this.data().slug();
            console.log(this.params.slug); //undefined
            console.log(expectedSlug);
            console.log(this.params.slug !== expectedSlug);
            console.log(this.params);
            if (this.params.slug !== expectedSlug) {
                this.redirect("jobhome", {
                    _id: this.params._id,
                    slug: expectedSlug
                });
            } else {
                this.next();
            }
        }
    });
/*
    this.route('jobx', {   //__originalId

        path: '/jobx/:__originalId/:slug?',
    //    name: 'jobx',
      //  template: 'jobx',
      //  path: '/jobs/:__originalId/:slug?',
 //     path: '/jobs/:_id',
        title: function() {
            if (this.data())
                return "Khidma - " + this.data().title;
        },
        data: function() {
          //  console.log(this.params.__originalId);
         //   console.log(this.params.query);
          console.log(this.data);
            return Jobs.findOne({
                _id: this.params.__originalId,

            });
        },
        waitOn: function() {
            return subs.subscribe("jobx", this.params.__originalId);
        },
        onBeforeAction: function() {
            var expectedSlug = this.data().slug();
            console.log(expectedSlug);

            if (this.params.slug !== expectedSlug) {

                this.redirect("jobx", {
                    _id: this.params.__originalId,
                    slug: expectedSlug
                });

            } else {
                this.next();
            }
        }
    });

*/
    this.route('jobNew', {
        path: '/job',
        title: "Khidma - Post a Job"
    });

    this.route('jobEdit', {
        path: '/jobs/:_id/:slug/edit',
        title: "Khidma - Edit Job Post",
        data: function() {
            return {
                job: Jobs.findOne({
                    _id: this.params._id
                })
            };
        },
        waitOn: function() {
            return subs.subscribe("job", this.params._id);
        }
    });

    this.route('profiles', {
        path: '/profiles',
        title: "Khidma - All Workers",
        subscriptions: function() {
            return subs.subscribe('developerUsers');
        }
    });

    this.route('profile', {
        path: '/profiles/:_id/:slug?',
        title: function() {
            if (this.data())
                return "Khidma - " + this.data().displayName() + " - " + this.data().title;
        },
        data: function() {
            return Profiles.findOne({
                _id: this.params._id
            });
        },
        waitOn: function() {
            return subs.subscribe('profile', this.params._id);
        },
        onBeforeAction: function() {
            var expectedSlug = this.data().slug();
            console.log(this.params.slug); //undefined
            console.log(expectedSlug);
            console.log(this.params.slug !== expectedSlug);
            console.log(this.params);
            if (this.params.slug !== expectedSlug) {
                this.redirect("profile", {
                    _id: this.params._id,
                    slug: expectedSlug
                });
            } else {
                this.next();
            }
        }
    });

    this.route('profileNew', {
        path: '/profile',
        title: "Khidma - Create Worker Profile",
        onBeforeAction: function() {
            if (Meteor.user().isDeveloper) {
                Router.go('profile', Profiles.findOne({
                    userId: Meteor.userId()
                }));
            } else {
                this.next();
            }
        }
    });

    this.route('profileEdit', {
        path: '/profiles/:_id/:slug/edit',
        title: "Khidma - Edit My Worker Profile",
        data: function() {
            return {
                profile: Profiles.findOne({
                    _id: this.params._id
                })
            };
        },
        waitOn: function() {
            return subs.subscribe('profile', this.params._id);
        }
    });


    
    //legacy url redirects
    this.route('experts', function() {
        this.redirect("profiles");
    });
    this.route('experts/:_id', function() {
        this.redirect("profile", {
            _id: this.params._id
        });
    });
});

Router.plugin('ensureSignedIn', {
    only: ['profileEdit', 'profileNew', 'jobEdit', 'jobNew']
});


Router.onBeforeAction(function() {
    loadUploadcare();
    this.next();
}, {
    only: ['profileEdit', 'profileNew', 'jobEdit', 'jobNew']
});

Router.plugin('dataNotFound', {
    notFoundTemplate: 'notFound'
});
