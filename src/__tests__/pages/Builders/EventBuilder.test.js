// src/builders/__tests__/EventBuilder.test.js
import EventBuilder from '../../../builders/EventBuilders';

describe('EventBuilder', () => {
  it('should build a complete event object with all fields', () => {
    const event = new EventBuilder()
      .setId('1')
      .setTitle('Demo Event')
      .setDescription('A test event for validation')
      .setFeaturedImage('image.jpg')
      .setStatus('Active')
      .setAcceptsRSVP(true)
      .setPrivacy('Public')
      .setFormat('Online')
      .setCategory('Tech')
      .setStartDate('2025-05-01')
      .setEndDate('2025-05-02')
      .setMaxParticipants(100)
      .setInvitedUsers(['user1', 'user2'])
      .setOrganizers(['org1'])
      .setParticipants(['user1'])
      .setLocation('Zoom')
      .setUrl('https://event-link.com')
      .build();

    expect(event).toEqual({
      id: '1',
      title: 'Demo Event',
      description: 'A test event for validation',
      featuredImage: 'image.jpg',
      status: 'Active',
      acceptsRSVP: true,
      privacy: 'Public',
      format: 'Online',
      category: 'Tech',
      startDate: '2025-05-01',
      endDate: '2025-05-02',
      maxParticipants: 100,
      invitedUsers: ['user1', 'user2'],
      organizers: ['org1'],
      participants: ['user1'],
      location: 'Zoom',
      inviteLink: 'https://event-link.com'
    });
  });

  it('should not set inviteLink if format is not Online', () => {
    const event = new EventBuilder()
      .setFormat('Offline')
      .setUrl('https://should-not-be-used.com')
      .build();

    expect(event).not.toHaveProperty('inviteLink');
  });
});
