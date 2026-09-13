# Admin test checklist
1. Start with `npm run dev` from the folder containing package.json.
2. Login from the combined `/login` page with Admin mode.
3. Open `/admin/studios`: room list should load; add/edit/delete should work.
4. Open `/admin/payments`: payment list should load; pending payments can be approved/rejected.
5. If a page cannot load, the page now shows the API error instead of a blank screen.
