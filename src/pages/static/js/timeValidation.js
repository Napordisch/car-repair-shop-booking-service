export async function isTimeOptionValid(time, selectedServices, year, month, day) {
    try {
        const occupiedIntervals = await fetch('/occupied-intervals')
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching occupied intervals:', error);
                return [];
            });

        const [hours, minutes] = time.split(':').map(Number);
        const timeDate = new Date(Date.UTC(year, month, day, hours, minutes, 0));
        
        for (const interval of occupiedIntervals) {
            const intervalStart = new Date(interval.start);
            const intervalEnd = new Date(interval.end);
            if (timeDate >= intervalStart && timeDate <= intervalEnd) {
                return false;
            }
        }

        const deadlineResponse = await fetch('/deadline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                initialVisitDate: timeDate,
                selectedServices: selectedServices
            })
        });

        if (!deadlineResponse.ok) return false;
        
        const { deadline } = await deadlineResponse.json();
        const deadlineDate = new Date(deadline);

        for (const interval of occupiedIntervals) {
            const intervalStart = new Date(interval.start);
            const intervalEnd = new Date(interval.end);
            if (timeDate <= intervalEnd && deadlineDate >= intervalStart) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error checking time validity:', error);
        return false;
    }
} 