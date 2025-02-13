export const validatePartnerId = (partnerId: string): boolean => {
  return /^[A-Za-z0-9-_]{4,32}$/.test(partnerId);
};

export const validateDateRange = (start: string, end: string): boolean => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate < endDate && startDate > new Date('2020-01-01');
};

export const validateFileMetadata = (metadata: any): boolean => {
  if (!metadata || typeof metadata !== 'object') return false;
  
  const allowedContentTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (metadata.contentType && !allowedContentTypes.includes(metadata.contentType)) {
    return false;
  }

  if (metadata.dimensions) {
    const { width, height } = metadata.dimensions;
    if ((width && typeof width !== 'number') || (height && typeof height !== 'number')) {
      return false;
    }
  }

  if (metadata.tags && (!Array.isArray(metadata.tags) || 
      !metadata.tags.every((tag: any) => typeof tag === 'string'))) {
    return false;
  }

  return true;
};

export const validatePermissions = (permissions: any): boolean => {
  if (!permissions || typeof permissions !== 'object') return false;

  if (typeof permissions.public !== 'boolean') return false;

  if (permissions.allowedUsers && 
      (!Array.isArray(permissions.allowedUsers) || 
       !permissions.allowedUsers.every((user: any) => typeof user === 'string'))) {
    return false;
  }

  if (permissions.allowedRoles &&
      (!Array.isArray(permissions.allowedRoles) ||
       !permissions.allowedRoles.every((role: any) => typeof role === 'string'))) {
    return false;
  }

  return true;
};

export const validateAnalyticsEvent = (event: any): boolean => {
  if (!event || typeof event !== 'object') return false;

  const validEventTypes = ['VIEW', 'INTERACTION', 'CONVERSION'];
  if (!validEventTypes.includes(event.eventType)) return false;

  if (!validatePartnerId(event.partnerId)) return false;

  const timestamp = new Date(event.timestamp);
  if (isNaN(timestamp.getTime())) return false;

  if (event.metadata) {
    if (typeof event.metadata !== 'object') return false;
    if (event.metadata.duration && typeof event.metadata.duration !== 'number') return false;
    if (event.metadata.value && typeof event.metadata.value !== 'number') return false;
  }

  return true;
};