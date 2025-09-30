const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src', 'components', 'meetings', 'MeetingsList.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add the isPastMeeting function after getCategoryBadge if it doesn't exist
if (!content.includes('isPastMeeting')) {
    // Find the end of getCategoryBadge function
    const getCategoryBadgeEnd = content.indexOf('const getCategoryBadge');
    if (getCategoryBadgeEnd !== -1) {
        // Find the closing of getCategoryBadge function
        let braceCount = 0;
        let inFunction = false;
        let endIndex = getCategoryBadgeEnd;
        
        for (let i = getCategoryBadgeEnd; i < content.length; i++) {
            if (content[i] === '{') {
                braceCount++;
                inFunction = true;
            } else if (content[i] === '}') {
                braceCount--;
                if (inFunction && braceCount === 0) {
                    // Found the end of the function, now find the semicolon
                    endIndex = i + 2; // Skip }; 
                    break;
                }
            }
        }
        
        const isPastMeetingFunction = `

  const isPastMeeting = (meeting) => {
    const { meetingDate, startTime, endTime } = meeting;
    if (!meetingDate || !startTime || !endTime) return false;

    const [year, month, day] = meetingDate.split('-').map(Number);
    const [endHourStr, endMinuteStr] = String(endTime).split(':');

    const end = new Date(year, (month || 1) - 1, day, Number(endHourStr), Number(endMinuteStr || 0));
    const now = new Date();

    return now > end;
  };`;
        
        content = content.slice(0, endIndex) + isPastMeetingFunction + content.slice(endIndex);
    }
}

// Update the Edit button
const oldButton = 'title="Edit Meeting"';
const newButton = `title={isPastMeeting(meeting) ? "Cannot edit past meetings" : "Edit Meeting"}
                      disabled={isPastMeeting(meeting)}`;
content = content.replace(oldButton, newButton);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log("Successfully updated MeetingsList.jsx");
