export const mapSheetRowToResearch = (row, topicOverride = null) => {
    // For now, we map the existing structure but present it as Research data.
    // If the backend generates an image, it might be in a specific column. 
    // I'll assume standard columns or 'thumbnail_url' if it's a generated image URL.

    // We will try to find an image URL from the row. 
    // If it was a YouTube recipe, it was using YouTube thumbnail. 
    // Here, we might need to look for a specific image column if it exists, or just use a placeholder if not found.
    // However, the user said "we will provide them in detailed image". 
    // If the system is "Deep Research", maybe the 'Infographic' is a result URL.

    let imageUrl = row['Image URL'] || row['Infographic URL'] || row['thumbnail_url'];

    // Legacy fallback for YT links if needed, though likely not for this use case anymore
    if (!imageUrl && row['Youtube Link']) {
        const getYouTubeID = (url) => {
            if (!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }
        const vidId = getYouTubeID(row['Youtube Link']);
        if (vidId) imageUrl = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
    }

    return {
        id: row['Log ID'] || null,
        title: row['Topic'] || row['overview.name'] || topicOverride || "Research Result",
        topic: topicOverride || row['Topic'],
        summary: row['Summary'] || row['overview.description'] || "Deep research completed.", // 'Summary' might not exist in CSV yet, but good fallback
        imageUrl: imageUrl,
        details: row
    };
};
