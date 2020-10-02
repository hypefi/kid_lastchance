/*Template.jobs.rendered = function() {
  $("#search-link").addClass('selected');
  $("#profile-link").removeClass('selected');
  $("#ranking-link").removeClass('selected');
  $("#jobs-link").removeClass('selected');
  $("#login-link").removeClass('selected');
};*/

Template.jobs.onCreated(function() {
  this.infiniteScroll({
    perPage: 30,
    subManager: subs,
    collection: Jobs,
    publication: 'jobs'
  });
});

Template.jobs.helpers({
inputAttributes: function() {
  return {'class': 'easy-search-input', 'placeholder': 'Start searching'};
},
jobs: function(){
  return Jobs.find({ status: "active" }, { sort: {         
    featuredThrough: -1,
    createdAt: -1
  }});
},
selectedName: function(){
//var job = JobsIndex.config.mongoCollection.findOne({ __originalId: Session.get("selectedJob")});
//var job = JobsIndex.config.mongoCollection.findOne( doc.__originalId);
var job = JobsIndex.config.mongoCollection.findOne( doc._id);

console.log(job && job.title);
return job;  
},
index: function(){
  return JobsIndex;
},
resultCount: function(){
  return JobsIndex.getCompomentdict().get('count');
},
showmore: function() {
  return false;
},
renderTmpl: () => Template.renderTemplate
});

Template.jobs.events({
  "change select": function (e) {
    JobsIndex
      .getComponentMethods(/* optional name */)
      .addProps("country", $(e.target).val());
  },
});

// On Client
Template.jobs.helpers({
  index: () => JobsIndex,
});










/*Tracker.autorun(function () {
  console.log(JobsIndex.search('Anas', { limit: 5, skip: 10 }).fetch())
});


var updateTextQuery = _.debounce(function(text, reactivevar){
  var query = reactivevar.get();
  if(!_.isEmpty(text))
    query.text = text;
  else
    delete query.text;
  reactivevar.set(query);
},250);*/

