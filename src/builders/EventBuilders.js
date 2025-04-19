// src/builders/EventBuilder.js
export default class EventBuilder {
    constructor() {
      this.event = {};
    }
  
    setId(id) {
      this.event.id = id;
      return this;
    }
    setTitle(title) {
      this.event.title = title;
      return this;
    }
    setDescription(desc) {
      this.event.description = desc;
      return this;
    }
    setFeaturedImage(url) {
      this.event.featuredImage = url;
      return this;
    }
    setStatus(status) {
      this.event.status = status;
      return this;
    }
    setAcceptsRSVP(flag) {
      this.event.acceptsRSVP = flag;
      return this;
    }
    setPrivacy(privacy) {
      this.event.privacy = privacy;
      return this;
    }
    setFormat(format) {
      this.event.format = format;
      return this;
    }
    setCategory(category) {
      this.event.category = category;
      return this;
    }
    setStartDate(date) {
      this.event.startDate = date;
      return this;
    }
    setEndDate(date) {
      this.event.endDate = date;
      return this;
    }
    setMaxParticipants(n) {
      this.event.maxParticipants = n;
      return this;
    }
    setInvitedUsers(list) {
      this.event.invitedUsers = list;
      return this;
    }
    setOrganizers(list) {
      this.event.organizers = list;
      return this;
    }
    setParticipants(list) {
      this.event.participants = list;
      return this;
    }
    setLocation(location) {
      this.event.location = location;
      return this;
    } 
  
    build() {
      return { ...this.event };
    }
  }
  