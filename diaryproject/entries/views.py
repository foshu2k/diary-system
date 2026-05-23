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
    selected_value = request.GET.get("value", "")

    try:
        if filter_type == "year" and selected_value:
            entries = entries.filter(date__year=int(selected_value))
        elif filter_type == "month" and selected_value:
            entries = entries.filter(date__month=int(selected_value))
        elif filter_type == "day" and selected_value:
            entries = entries.filter(date__day=int(selected_value))
    except ValueError:
        pass

    all_entries = Entry.objects.all()

    available_years = sorted(
        set(all_entries.values_list("date__year", flat=True)),
        reverse=True
    )

    available_months = [
        {"value": str(i).zfill(2), "label": timezone.datetime(2000, i, 1).strftime("%B")}
        for i in sorted(set(all_entries.values_list("date__month", flat=True)))
    ]

    available_days = sorted(
        set(all_entries.values_list("date__day", flat=True))
    )

    return render(request, "entries/entry_list.html", {
        "entries": entries,
        "active_filter": filter_type,
        "selected_value": selected_value,
        "available_years": available_years,
        "available_months": available_months,
        "available_days": available_days,
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