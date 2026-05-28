from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Entry
from .forms import EntryForm
from .filters import EntryFilter

@login_required
def home(request):
    entries = Entry.objects.filter(user=request.user).order_by("-created_at")
    return render(request, "entries/home.html", {"entries" : entries})

@login_required
def entry_list(request):
    entries = Entry.objects.filter(user=request.user).order_by("-created_at")
    search_query = request.GET.get("search", "")

    entry_filter = EntryFilter(request.GET, queryset=entries)
    filtered_entries = entry_filter.qs
    
    if search_query and not entry_filter.filter_errors:
        filtered_entries = filtered_entries.filter(title__icontains=search_query)
        
    return render(request, "entries/entry_list.html", {
        "entries": filtered_entries, 
        "search_query" : search_query,
        "entry_filter": entry_filter,
        "filter_errors": entry_filter.filter_errors
    })

@login_required
def entry_detail(request, id):
    entry = get_object_or_404(Entry, id=id, user=request.user)
    return render(request, "entries/entry_detail.html", {"entry" : entry})

@login_required
def create_entry(request):
    if request.method == "POST":
        form = EntryForm(request.POST)

        if form.is_valid():
            entry = form.save(commit=False)
            entry.user = request.user
            entry.save()
            return redirect("entry_list")
    else:
        form = EntryForm()
    
    return render(request, "entries/entry_form.html", {"form" : form})

@login_required
def edit_entry(request, id ):
    entry = get_object_or_404(Entry, id=id, user=request.user)

    if request.method == "POST":
        form = EntryForm(request.POST, instance=entry)

        if form.is_valid():
            entry = form.save()
            return redirect("entry_detail", id=entry.id)
    else:
        form = EntryForm(instance=entry)
    
    return render(request, "entries/entry_form.html", {"form" : form})

@login_required
def delete_entry(request, id):
    entry = get_object_or_404(Entry, id=id, user=request.user)

    if request.method == "POST":
        entry.delete()
        return redirect("entry_list")

    return redirect("entry_detail", id=id)