from django.shortcuts import render, redirect, get_object_or_404
from .models import Entry
from .forms import EntryForm

def home(request):
    entries = Entry.objects.all()
    return render(request, "entries/home.html", {"entries" : entries})

def entry_list(request):
    search_query = request.GET.get("search", "")
    entries = Entry.objects.all().order_by("-date")
    
    if search_query:
        entries = entries.filter(title__icontains=search_query)
        
    return render(request, "entries/entry_list.html", {"entries": entries, "search_query" : search_query})

def entry_detail(request, id):
    entry = get_object_or_404(Entry, id=id)
    return render(request, "entries/entry_detail.html", {"entry" : entry})

def create_entry(request):
    if request.method == "POST":
        form = EntryForm(request.POST)

        if form.is_valid():
            form.save()
            return redirect("entry_list")
    else:
        form = EntryForm()
    
    return render(request, "entries/entry_form.html", {"form" : form})

def edit_entry(request, id):
    entry = get_object_or_404(Entry, id=id)

    if request.method == "POST":
        form = EntryForm(request.POST, instance=entry)

        if form.is_valid():
            entry = form.save()
            return redirect("entry_detail", id=entry.id)
    else:
        form = EntryForm(instance=entry)
    
    return render(request, "entries/entry_form.html", {"form" : form})

def delete_entry(request, id):
    entry = get_object_or_404(Entry, id=id)

    if request.method == "POST":
        entry.delete()
        return redirect("entry_list")

    return redirect("entry_detail", id=id)