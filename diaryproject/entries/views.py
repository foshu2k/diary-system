from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from .models import Entry
from .forms import EntryForm

def home(request):
    entries = Entry.objects.all()
    return render(request, "entries/home.html", {"entries" : entries})

def entry_list(request):
    entries = Entry.objects.all().order_by("-date")
    filter_type = request.GET.get("filter", "all")
    today = timezone.now().date()

    if filter_type == "year":
        entries = entries.filter(date__year=today.year)
    elif filter_type == "month":
        entries = entries.filter(date__year=today.year, date__month=today.month)
    elif filter_type ==  "day":
        entries = entries.filter(date__year=today)

    return render(request, "entries/entry_list.html", {
        "entries" : entries,
        "active_filter" : filter_type
    })

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
            form.save()
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