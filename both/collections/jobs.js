Jobs = new Mongo.Collection("jobs");

Jobs.attachSchema(
  new SimpleSchema({
    title: {
      type: String,
      label: "Job Title",
      max: 128
    },
    company: {
      type: String,
      label: "Company",
      max: 128,
      optional: true
    },
    location: {
      type: String,
      label: "Location",
      max: 128,
      optional: true
    },
    url: {
      type: String,
      label: "URL",
      max: 256,
      optional: true,
      regEx: SimpleSchema.RegEx.Url
    },
    contact: {
      type: String,
      label: "Contact Info",
      max: 128
    },
    jobtype: {
      type: String,
      label: "Job Type",
      allowedValues: JOB_TYPES
    },
    remote: {
      type: Boolean,
      label: "This is a remote position."
    },
    userId: {
      type: String,
      label: "User Id",
      autoValue: function() {
        if (this.isInsert) {
          return Meteor.userId();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: Meteor.userId()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    },
    userName: {
      type: String,
      label: "User Name",
      autoValue: function() {
        if (this.isInsert) {
          return getUserName(Meteor.user());
        } else if (this.isUpsert) {
          return {
            $setOnInsert: getUserName(Meteor.user())
          };
        } else {
          this.unset();
        }
      }
    },
    description: {
      type: String,
      label: "Job Description",
      max: 100000,
      autoform: {
        afFieldInput: SUMMERNOTE_OPTIONS
      }
    },
    status: {
      type: String,
      allowedValues: STATUSES,
      autoValue: function() {
        if (this.isInsert) {
          return 'pending';
        } else if (this.isUpsert) {
          return {
            $setOnInsert: 'pending'
          };
        }
      },
    },
    featuredThrough: {
      type: Date,
      optional: true
    },
    featuredChargeHistory: {
      type: [String],
      optional: true
    },
    // Automatically set HTML content based on markdown content
    // whenever the markdown content is set.
    htmlDescription: {
      type: String,
      optional: true,
      autoValue: function(doc) {
        var htmlContent = this.field("description");
        if (Meteor.isServer && htmlContent.isSet) {
          return cleanHtml(htmlContent.value);
        }
      }
    },
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    createdAt: {
      type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: new Date()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    },
    // Force value to be current date (on server) upon update
    // and don't allow it to be set upon insert.
    updatedAt: {
      type: Date,
      autoValue: function() {
        if (this.isUpdate) {
          return new Date();
        }
      },
      denyInsert: true,
      optional: true
    }
  })
);

if (Meteor.isServer) {
  Jobs._ensureIndex({
    "company": "text",
    "description": "text",
    "location": "text",
    "title": "text",
    "userName": "text"
  });
}

Jobs.helpers({
  path: function() {
   // return 'jobs/' + this.__originalId + '/' + this.slug();
   return 'jobs/' + this._id + '/' + this.slug();
   //return 'jobs/' + this._id;
  },
  slug: function() {
    return getSlug(this.title);
  },
  featured: function() {
    return this.featuredThrough && moment().isBefore(this.featuredThrough);
  },
  featuredAllowed: function() {
    return this.status === "pending" || this.status === "active";
  },
  displayName: function() {
    return this.name || this.userName;
  }
});

Jobs.allow({
  insert: function(userId, doc) {
    return userId && doc && userId === doc.userId;
  },
  update: function(userId, doc, fieldNames, modifier) {
  
  return Roles.userIsInRole(userId, ['admin']) ||
      (!_.contains(fieldNames, 'htmlDescription') && !_.contains(fieldNames, 'status') && !_.contains(fieldNames, 'featuredThrough') && !_.contains(fieldNames, 'featuredChargeHistory') && /*doc.status === "pending" &&*/ userId && doc && userId === doc.userId);

  //  return Roles.userIsInRole(userId, ['admin']) || (!_.contains(fieldNames, 'randomSorter') && !_.contains(fieldNames, 'htmlDescription') && !_.contains(fieldNames, 'status') && userId && doc && userId === doc.userId);
  //return Roles.userIsInRole(userId, ['admin']) || (!_.contains(fieldNames, 'htmlDescription') && !_.contains(fieldNames, 'status') && !_.contains(fieldNames, 'featuredThrough') && !_.contains(fieldNames, 'featuredChargeHistory') && doc.status === "pending" &&*/// userId && doc && userId === doc.userId);

  },
  remove: function(userId, doc) {
    //return Roles.userIsInRole(userId, ['admin']) || (userId && doc && userId === doc.userId);
    return false;  
  },
  fetch: ['userId', 'status']
});

/*Profiles.helpers({
  displayName: function() {
    return this.name || this.userName;
  },
  path: function() {
    return 'profiles/' + this._id + '/' + this.slug();
  },
  slug: function() {
    return getSlug(this.displayName() + ' ' + this.title);
  }
});*/

//original
/*Jobs.allow({    
  insert: function(userId, doc) {
    return userId && doc && userId === doc.userId;
  },
  update: function(userId, doc, fieldNames, modifier) {
    return Roles.userIsInRole(userId, ['admin']) ||
//      (!_.contains(fieldNames, 'htmlDescription') && !_.contains(fieldNames, 'status') && !_.contains(fieldNames, 'featuredThrough') && !_.contains(fieldNames, 'featuredChargeHistory') && /*doc.status === "pending" &&*/// userId && doc && userId === doc.userId);
// },
  
/*  remove: function(userId, doc) {
    return false;
  },
  fetch: ['userId', 'status']
}); */


/*
if (Meteor.isServer) {
  Jobs._ensureIndex({
    "userName": "text",
    "name": "text",
    "title": "text",
    "description": "text",
    "location": "text"
  });
}
*/
//for easy search 
//////////

/*
jobsIndex = new EasySearch.Index({
  collection: Jobs,
  fields: ['Description'],
  engine: new EasySearch.MongoDB()
})



*/

JobsIndex = new EasySearch.Index({
  engine: new EasySearch.MongoDB({
    sort: function () {
      return { createdAt: -1 };
    },
    selector: function (searchObject, options, aggregation) {
      // selector contains the default mongo selector that Easy Search would use
      let selector = this.defaultConfiguration().selector(
        searchObject,
        options,
        aggregation
      );

      // modify the selector to only match documents where region equals "New York"
      selector.status = "active";
      return selector;
    },
    /*   selector: function(searchObject, options, aggregation) {
      let selector = this.defaultConfiguration().selector(searchObject, options, aggregation),
      categoryFilter = options.search.props.categoryFilter;

      if(_.isString(categoryFilter) && !_.isEmpty(categoryFilter)) {
        selector.category = categoryFilter;
      }

      return selector;
    } */
  }),
  collection: Jobs,
  fields: ["description", "title", "location", "company"],
  defaultSearchOptions: {
    limit: 30,
  },
  permission: () => {
    return true;
  },
});



/*

JobsIndex = new EasySearch.Index({
      engine: new EasySearch.MongoDB({
            sort: function(){
              return { createdAt: -1 };
            },
            selector: function(searchObject, options, aggregation){
            let selector = this.defaultConfiguration().selector(searchObject, options, aggregation),
            categoryFilter = options.search.props.categoryFilter;

            if(_.isString(categoryFilter) && !_.isEmpty(categoryFilter)){
              selector.category = categoryFilter;
              }
              return selector;
            
               }
                 }),
            collection: Jobs,
            fields: ['Job Title','Job Description'],
            defaultSearchOptions: {
            limit:10
               },

              permission: () => {
               return true;
              }
}); */