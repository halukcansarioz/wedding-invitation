export async function setupE2EMocks(page) {
  await page.route('**/*', route => {
    const type = route.request().resourceType();
    
    if (type === 'image' || type === 'media' || type === 'font') {
      return route.continue();
    }
    
    if (route.request().url().includes('supabase.co')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], error: null })
      });
    }

    return route.continue();
  });
}