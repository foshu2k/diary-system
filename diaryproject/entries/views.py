from django.shortcuts import render, redirect, get_object_or_404
from .models import Entry
from .forms import EntryForm

def entry_list(request):
    entries = Entry.objects.all()
    return render(request, "entries/entry_list.html", {"entries" : entries})

def entry_detail(request, id):
    entry = get_object_or_404(Entry, id=id)
    return render(request, 'entries/entry_detail.html', {"entry" : entry})

def create_entry(request):
    if request.method == "POST":
        form = EntryForm(request.POST)

        if form.is_valid():
            form.save()
            return redirect("entry_list")
    
    else:
        form = EntryForm()
    
    return render(request, "entries/entry_form.html", {"form" : form})

def calendar(request):
    return render(request, "entries/calendar.html")