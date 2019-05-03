%define base_name srcmap-reverse

Name:       iml-%{base_name}
Version:    3.0.7
# Release Start
Release:    1%{?dist}
# Release End
Summary:    Service that reverses source map traces.
License:    MIT
Group:      System Environment/Libraries
URL:        https://github.com/whamcloud/%{base_name}
Source0:    %{name}-%{version}.tgz
Source1:    %{name}.socket
Source2:    %{name}.service

%{?systemd_requires}
BuildRequires: systemd

BuildArch:  noarch
ExclusiveArch: %{nodejs_arches} noarch

BuildRequires:  nodejs-packaging
Requires: nodejs

%description
This module will run a http server listening on /var/run/iml-srcmap-reverse.sock. When the server receives
a trace statement, it will parallelize the process of reversing the trace against the GUI source map line 
by line.

%prep
%setup -q -n package

%build
#nothing to do

%install
mkdir -p %{buildroot}%{_unitdir}
mkdir -p %{buildroot}%{nodejs_sitelib}/@iml/%{base_name}/dist
cp %{name}.service %{buildroot}%{_unitdir}
cp %{name}.socket %{buildroot}%{_unitdir}
cp -al dist/. %{buildroot}%{nodejs_sitelib}/@iml/%{base_name}/dist
cp -p package.json %{buildroot}%{nodejs_sitelib}/@iml/%{base_name}

%post
systemctl preset iml-srcmap-reverse.socket

%preun
%systemd_preun iml-srcmap-reverse.service
%systemd_preun iml-srcmap-reverse.socket

%postun
%systemd_postun_with_restart iml-srcmap-reverse.service

%clean
rm -rf %{buildroot}

%files
%{nodejs_sitelib}
%attr(0755,root,root)%{nodejs_sitelib}/@iml/%{base_name}
%attr(0644,root,root)%{_unitdir}/%{name}.socket
%attr(0644,root,root)%{_unitdir}/%{name}.service

%changelog
* Thu Jul 26 2018 Will Johnson <wjohnson@whamcloud.com> - 3.0.7-1
- Systemd updates
- Dockerize
- Continous deployment

* Thu Aug 3 2017 Will Johnson <william.c.johnson@intel.com> - 3.0.6-1
- Add logging for each reversed trace.

* Tue Aug 1 2017 Joe Grund <joe.grund@intel.com> - 3.0.5-2
- Removed nodejs_find_provides_and_requires macro.
- Fixed source to resolve to npm.
- Added Requires: nodejs.

* Wed Jul 26 2017 William Johnson <william.c.johnson@intel.com> - 3.0.5-1
- initial package