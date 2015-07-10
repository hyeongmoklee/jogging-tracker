from django.shortcuts import render_to_response
from django.template.context import RequestContext


def main(request):
    return render_to_response('base.html',
                              locals(),
                              context_instance=RequestContext(request))